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
import Box from '@mui/material/Box';
import { RepeatItemContainerStack } from './RepeatItem.styles';
import SingleItem from '../SingleItem/SingleItem';
import type {
  QuestionnaireItem,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import type {
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler,
  PropsWithShowMinimalViewAttribute
} from '../../../interfaces/renderProps.interface';
import RemoveItemButton from './RemoveItemButton';
import useReadOnly from '../../../hooks/useReadOnly';

interface RepeatFieldProps
  extends PropsWithQrItemChangeHandler,
    PropsWithShowMinimalViewAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
  answer: QuestionnaireResponseItemAnswer | null;
  numOfRepeatAnswers: number;
  onDeleteAnswer: () => void;
}

function RepeatField(props: RepeatFieldProps) {
  const {
    qItem,
    qrItem,
    answer,
    numOfRepeatAnswers,
    parentIsReadOnly,
    showMinimalView,
    onDeleteAnswer,
    onQrItemChange
  } = props;

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  return (
    <RepeatItemContainerStack direction="row">
      <Box sx={{ flexGrow: 1 }}>
        <SingleItem
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={qItem.repeats ?? false}
          isTabled={false}
          showMinimalView={showMinimalView}
          parentIsReadOnly={parentIsReadOnly}
          onQrItemChange={onQrItemChange}
        />
      </Box>
      {showMinimalView ? null : (
        <RemoveItemButton
          answer={answer}
          numOfRepeatAnswers={numOfRepeatAnswers}
          readOnly={readOnly}
          onDeleteAnswer={onDeleteAnswer}
        />
      )}
    </RepeatItemContainerStack>
  );
}

export default RepeatField;
