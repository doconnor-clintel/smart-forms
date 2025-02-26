/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createStore } from 'zustand/vanilla';
import type {
  Coding,
  Questionnaire,
  QuestionnaireResponse,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import type { Variables } from '../interfaces/variables.interface';
import type { LaunchContext } from '../interfaces/populate.interface';
import type { CalculatedExpression } from '../interfaces/calculatedExpression.interface';
import type { EnableWhenExpression, EnableWhenItems } from '../interfaces/enableWhen.interface';
import type { AnswerExpression } from '../interfaces/answerExpression.interface';
import type { Tabs } from '../interfaces/tab.interface';
import { updateItemAnswer } from '../utils/enableWhen';
import { evaluateUpdatedExpressions } from '../utils/fhirpath';
import {
  evaluateInitialCalculatedExpressions,
  initialiseCalculatedExpressionValues
} from '../utils/calculatedExpression';
import { createQuestionnaireModel } from '../utils/questionnaireStoreUtils/createQuestionaireModel';
import { initialiseFormFromResponse } from '../utils/initialise';
import { emptyQuestionnaire, emptyResponse } from '../utils/emptyResource';
import cloneDeep from 'lodash.clonedeep';
import { terminologyServerStore } from './terminologyServerStore';
import { createSelectors } from './selector';

interface QuestionnaireStoreType {
  sourceQuestionnaire: Questionnaire;
  itemTypes: Record<string, string>;
  tabs: Tabs;
  currentTabIndex: number;
  variables: Variables;
  launchContexts: Record<string, LaunchContext>;
  enableWhenItems: EnableWhenItems;
  enableWhenLinkedQuestions: Record<string, string[]>;
  enableWhenIsActivated: boolean;
  enableWhenExpressions: Record<string, EnableWhenExpression>;
  calculatedExpressions: Record<string, CalculatedExpression>;
  answerExpressions: Record<string, AnswerExpression>;
  processedValueSetCodings: Record<string, Coding[]>;
  processedValueSetUrls: Record<string, string>;
  cachedValueSetCodings: Record<string, Coding[]>;
  fhirPathContext: Record<string, any>;
  readOnly: boolean;
  buildSourceQuestionnaire: (
    questionnaire: Questionnaire,
    questionnaireResponse?: QuestionnaireResponse,
    additionalVariables?: Record<string, object>,
    terminologyServerUrl?: string,
    readOnly?: boolean
  ) => Promise<void>;
  destroySourceQuestionnaire: () => void;
  switchTab: (newTabIndex: number) => void;
  markTabAsComplete: (tabLinkId: string) => void;
  updateEnableWhenItem: (linkId: string, newAnswer: QuestionnaireResponseItemAnswer[]) => void;
  toggleEnableWhenActivation: (isActivated: boolean) => void;
  updateExpressions: (updatedResponse: QuestionnaireResponse) => void;
  addCodingToCache: (valueSetUrl: string, codings: Coding[]) => void;
  updatePopulatedProperties: (
    populatedResponse: QuestionnaireResponse,
    persistTabIndex?: boolean
  ) => QuestionnaireResponse;
}

export const questionnaireStore = createStore<QuestionnaireStoreType>()((set, get) => ({
  sourceQuestionnaire: cloneDeep(emptyQuestionnaire),
  itemTypes: {},
  tabs: {},
  currentTabIndex: 0,
  variables: { fhirPathVariables: {}, xFhirQueryVariables: {} },
  launchContexts: {},
  calculatedExpressions: {},
  enableWhenExpressions: {},
  answerExpressions: {},
  enableWhenItems: {},
  enableWhenLinkedQuestions: {},
  enableWhenIsActivated: true,
  processedValueSetCodings: {},
  processedValueSetUrls: {},
  cachedValueSetCodings: {},
  fhirPathContext: {},
  readOnly: false,
  buildSourceQuestionnaire: async (
    questionnaire,
    questionnaireResponse = cloneDeep(emptyResponse),
    additionalVariables = {},
    terminologyServerUrl = terminologyServerStore.getState().url,
    readOnly = false
  ) => {
    const questionnaireModel = await createQuestionnaireModel(
      questionnaire,
      additionalVariables,
      terminologyServerUrl
    );

    const {
      initialEnableWhenItems,
      initialEnableWhenLinkedQuestions,
      initialEnableWhenExpressions,
      initialCalculatedExpressions,
      firstVisibleTab,
      updatedFhirPathContext
    } = initialiseFormFromResponse({
      questionnaireResponse,
      enableWhenItems: questionnaireModel.enableWhenItems,
      enableWhenExpressions: questionnaireModel.enableWhenExpressions,
      calculatedExpressions: questionnaireModel.calculatedExpressions,
      variablesFhirPath: questionnaireModel.variables.fhirPathVariables,
      tabs: questionnaireModel.tabs,
      fhirPathContext: questionnaireModel.fhirPathContext
    });

    set({
      sourceQuestionnaire: questionnaire,
      itemTypes: questionnaireModel.itemTypes,
      tabs: questionnaireModel.tabs,
      currentTabIndex: firstVisibleTab,
      variables: questionnaireModel.variables,
      launchContexts: questionnaireModel.launchContexts,
      enableWhenItems: initialEnableWhenItems,
      enableWhenLinkedQuestions: initialEnableWhenLinkedQuestions,
      enableWhenExpressions: initialEnableWhenExpressions,
      calculatedExpressions: initialCalculatedExpressions,
      answerExpressions: questionnaireModel.answerExpressions,
      processedValueSetCodings: questionnaireModel.processedValueSetCodings,
      processedValueSetUrls: questionnaireModel.processedValueSetUrls,
      fhirPathContext: updatedFhirPathContext,
      readOnly: readOnly
    });
  },
  destroySourceQuestionnaire: () =>
    set({
      sourceQuestionnaire: cloneDeep(emptyQuestionnaire),
      itemTypes: {},
      tabs: {},
      currentTabIndex: 0,
      variables: { fhirPathVariables: {}, xFhirQueryVariables: {} },
      launchContexts: {},
      enableWhenItems: {},
      enableWhenLinkedQuestions: {},
      enableWhenExpressions: {},
      calculatedExpressions: {},
      answerExpressions: {},
      processedValueSetCodings: {},
      processedValueSetUrls: {},
      fhirPathContext: {}
    }),
  switchTab: (newTabIndex: number) => set(() => ({ currentTabIndex: newTabIndex })),
  markTabAsComplete: (tabLinkId: string) => {
    const tabs = get().tabs;
    set(() => ({
      tabs: {
        ...tabs,
        [tabLinkId]: { ...tabs[tabLinkId], isComplete: !tabs[tabLinkId].isComplete }
      }
    }));
  },
  updateEnableWhenItem: (linkId: string, newAnswer: QuestionnaireResponseItemAnswer[]) => {
    const enableWhenLinkedQuestions = get().enableWhenLinkedQuestions;
    const enableWhenItems = get().enableWhenItems;
    if (!enableWhenLinkedQuestions[linkId]) {
      return;
    }

    const itemLinkedQuestions = enableWhenLinkedQuestions[linkId];
    const updatedEnableWhenItems = updateItemAnswer(
      { ...enableWhenItems },
      itemLinkedQuestions,
      linkId,
      newAnswer
    );

    set(() => ({
      enableWhenItems: updatedEnableWhenItems
    }));
  },
  toggleEnableWhenActivation: (isActivated: boolean) =>
    set(() => ({ enableWhenIsActivated: isActivated })),
  updateExpressions: (updatedResponse: QuestionnaireResponse) => {
    const {
      isUpdated,
      updatedEnableWhenExpressions,
      updatedCalculatedExpressions,
      updatedFhirPathContext
    } = evaluateUpdatedExpressions({
      updatedResponse,
      enableWhenExpressions: get().enableWhenExpressions,
      calculatedExpressions: get().calculatedExpressions,
      variablesFhirPath: get().variables.fhirPathVariables,
      existingFhirPathContext: get().fhirPathContext
    });

    if (isUpdated) {
      set(() => ({
        enableWhenExpressions: updatedEnableWhenExpressions,
        calculatedExpressions: updatedCalculatedExpressions,
        fhirPathContext: updatedFhirPathContext
      }));
      return 0;
    }

    set(() => ({
      fhirPathContext: updatedFhirPathContext
    }));
  },
  addCodingToCache: (valueSetUrl: string, codings: Coding[]) =>
    set(() => ({
      cachedValueSetCodings: {
        ...get().cachedValueSetCodings,
        [valueSetUrl]: codings
      }
    })),
  updatePopulatedProperties: (populatedResponse: QuestionnaireResponse, persistTabIndex) => {
    const evaluateInitialCalculatedExpressionsResult = evaluateInitialCalculatedExpressions({
      initialResponse: populatedResponse,
      calculatedExpressions: get().calculatedExpressions,
      variablesFhirPath: get().variables.fhirPathVariables,
      existingFhirPathContext: get().fhirPathContext
    });
    const { initialCalculatedExpressions } = evaluateInitialCalculatedExpressionsResult;
    let updatedFhirPathContext = evaluateInitialCalculatedExpressionsResult.updatedFhirPathContext;

    const updatedResponse = initialiseCalculatedExpressionValues(
      get().sourceQuestionnaire,
      populatedResponse,
      initialCalculatedExpressions
    );

    const {
      initialEnableWhenItems,
      initialEnableWhenLinkedQuestions,
      initialEnableWhenExpressions,
      firstVisibleTab
    } = initialiseFormFromResponse({
      questionnaireResponse: updatedResponse,
      enableWhenItems: get().enableWhenItems,
      enableWhenExpressions: get().enableWhenExpressions,
      calculatedExpressions: initialCalculatedExpressions,
      variablesFhirPath: get().variables.fhirPathVariables,
      tabs: get().tabs,
      fhirPathContext: updatedFhirPathContext
    });
    updatedFhirPathContext = evaluateInitialCalculatedExpressionsResult.updatedFhirPathContext;

    set(() => ({
      enableWhenItems: initialEnableWhenItems,
      enableWhenLinkedQuestions: initialEnableWhenLinkedQuestions,
      enableWhenExpressions: initialEnableWhenExpressions,
      calculatedExpressions: initialCalculatedExpressions,
      currentTabIndex: persistTabIndex ? get().currentTabIndex : firstVisibleTab,
      fhirPathContext: updatedFhirPathContext
    }));

    return updatedResponse;
  }
}));

export const useQuestionnaireStore = createSelectors(questionnaireStore);
