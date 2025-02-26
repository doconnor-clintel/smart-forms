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

import React, { useMemo } from 'react';
import Container from '@mui/material/Container';
import Fade from '@mui/material/Fade';
import FormTopLevelItem from './FormTopLevelItem';
import type { QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';
import { useQuestionnaireResponseStore, useQuestionnaireStore } from '../../stores';
import cloneDeep from 'lodash.clonedeep';
import { getQrItemsIndex, mapQItemsIndex } from '../../utils/mapItem';
import { updateQrItemsInGroup } from '../../utils/qrItem';
import type { QrRepeatGroup } from '../../interfaces/repeatGroup.interface';

function BaseRenderer() {
  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();
  const updateExpressions = useQuestionnaireStore.use.updateExpressions();
  const readOnly = useQuestionnaireStore.use.readOnly();

  const updatableResponse = useQuestionnaireResponseStore.use.updatableResponse();
  const updateResponse = useQuestionnaireResponseStore.use.updateResponse();

  const qItemsIndexMap = useMemo(() => mapQItemsIndex(sourceQuestionnaire), [sourceQuestionnaire]);

  function handleTopLevelQRItemSingleChange(newTopLevelQRItem: QuestionnaireResponseItem) {
    const updatedResponse: QuestionnaireResponse = cloneDeep(updatableResponse);
    if (!updatedResponse.item || updatedResponse.item.length === 0) {
      return;
    }

    updateQrItemsInGroup(newTopLevelQRItem, null, updatedResponse, qItemsIndexMap);

    updateExpressions(updatedResponse);
    updateResponse(updatedResponse);
  }

  function handleTopLevelQRItemMultipleChange(newTopLevelQRItems: QrRepeatGroup) {
    const updatedResponse: QuestionnaireResponse = cloneDeep(updatableResponse);
    if (!updatedResponse.item || updatedResponse.item.length === 0) {
      return;
    }

    updateQrItemsInGroup(null, newTopLevelQRItems, updatedResponse, qItemsIndexMap);

    updateExpressions(updatedResponse);
    updateResponse(updatedResponse);
  }

  const topLevelQItems = sourceQuestionnaire.item;
  const topLevelQRItems = cloneDeep(updatableResponse.item) ?? [];

  if (!topLevelQItems) {
    return <>Questionnaire does not have any items</>;
  }

  // If an item has multiple answers, it is a repeat group
  const topLevelQRItemsByIndex = getQrItemsIndex(topLevelQItems, topLevelQRItems, qItemsIndexMap);

  return (
    <Fade in={true} timeout={500}>
      <Container maxWidth="xl">
        {topLevelQItems.map((qItem, index) => {
          const qrItemOrItems = topLevelQRItemsByIndex[index];

          return (
            <FormTopLevelItem
              key={qItem.linkId}
              topLevelQItem={qItem}
              topLevelQRItemOrItems={qrItemOrItems ?? null}
              parentIsReadOnly={readOnly}
              onQrItemChange={(newTopLevelQRItem) =>
                handleTopLevelQRItemSingleChange(newTopLevelQRItem)
              }
              onQrRepeatGroupChange={(newTopLevelQRItems) =>
                handleTopLevelQRItemMultipleChange(newTopLevelQRItems)
              }
            />
          );
        })}
      </Container>
    </Fade>
  );
}

export default BaseRenderer;
