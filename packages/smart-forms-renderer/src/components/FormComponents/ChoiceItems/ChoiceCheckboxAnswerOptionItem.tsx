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

import React from 'react';
import Grid from '@mui/material/Grid';
import type { ChoiceItemOrientation } from '../../../interfaces/choice.enum';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { updateQrCheckboxAnswers } from '../../../utils/choice';
import { FullWidthFormComponentBox } from '../../Box.styles';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler,
  PropsWithShowMinimalViewAttribute
} from '../../../interfaces/renderProps.interface';
import DisplayInstructions from '../DisplayItem/DisplayInstructions';
import LabelWrapper from '../ItemParts/ItemLabelWrapper';
import ChoiceCheckboxAnswerValueSetFields from './ChoiceCheckboxAnswerOptionFields';
import useReadOnly from '../../../hooks/useReadOnly';

interface ChoiceCheckboxAnswerOptionItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithIsRepeatedAttribute,
    PropsWithShowMinimalViewAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
  orientation: ChoiceItemOrientation;
}

function ChoiceCheckboxAnswerOptionItem(props: ChoiceCheckboxAnswerOptionItemProps) {
  const {
    qItem,
    qrItem,
    orientation,
    isRepeated,
    showMinimalView = false,
    parentIsReadOnly,
    onQrItemChange
  } = props;

  // Init input value
  const qrChoiceCheckbox = qrItem ?? createEmptyQrItem(qItem);
  const answers = qrChoiceCheckbox.answer ? qrChoiceCheckbox.answer : [];

  const readOnly = useReadOnly(qItem, parentIsReadOnly);
  const { displayInstructions } = useRenderingExtensions(qItem);

  // Event handlers
  function handleCheckedChange(changedValue: string) {
    const answerOptions = qItem.answerOption;
    if (!answerOptions) return null;

    const updatedQrChoiceCheckbox = updateQrCheckboxAnswers(
      changedValue,
      answers,
      answerOptions,
      qrChoiceCheckbox,
      isRepeated
    );

    if (updatedQrChoiceCheckbox) {
      onQrItemChange(updatedQrChoiceCheckbox);
    }
  }

  if (showMinimalView) {
    return (
      <>
        <ChoiceCheckboxAnswerValueSetFields
          qItem={qItem}
          answers={answers}
          orientation={orientation}
          readOnly={readOnly}
          onCheckedChange={handleCheckedChange}
        />
        <DisplayInstructions displayInstructions={displayInstructions} readOnly={readOnly} />
      </>
    );
  }

  return (
    <FullWidthFormComponentBox data-test="q-item-choice-checkbox-answer-option-box">
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <LabelWrapper qItem={qItem} readOnly={readOnly} />
        </Grid>
        <Grid item xs={7}>
          <ChoiceCheckboxAnswerValueSetFields
            qItem={qItem}
            answers={answers}
            orientation={orientation}
            readOnly={readOnly}
            onCheckedChange={handleCheckedChange}
          />
          <DisplayInstructions displayInstructions={displayInstructions} readOnly={readOnly} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );
}

export default ChoiceCheckboxAnswerOptionItem;
