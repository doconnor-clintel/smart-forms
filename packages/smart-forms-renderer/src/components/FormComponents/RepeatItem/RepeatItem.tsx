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

import React, { useState } from 'react';
import type {
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import type { PropsWithShowMinimalViewAttribute } from '../../../interfaces/renderProps.interface';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { nanoid } from 'nanoid';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { FullWidthFormComponentBox } from '../../Box.styles';
import AddItemButton from './AddItemButton';
import { TransitionGroup } from 'react-transition-group';
import RepeatField from './RepeatField';
import Collapse from '@mui/material/Collapse';
import useInitialiseRepeatAnswers from '../../../hooks/useInitialiseRepeatAnswers';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import useReadOnly from '../../../hooks/useReadOnly';

interface RepeatItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithShowMinimalViewAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
}

function RepeatItem(props: RepeatItemProps) {
  const { qItem, qrItem, showMinimalView, parentIsReadOnly, onQrItemChange } = props;

  const readOnly = useReadOnly(qItem, parentIsReadOnly);
  const { displayInstructions } = useRenderingExtensions(qItem);

  const initialRepeatAnswers = useInitialiseRepeatAnswers(qItem, qrItem);

  const [repeatAnswers, setRepeatAnswers] = useState(initialRepeatAnswers);

  // Event Handlers
  function handleAnswerChange(newQrItem: QuestionnaireResponseItem, index: number) {
    const updatedRepeatAnswers = [...repeatAnswers];
    updatedRepeatAnswers[index].answer = newQrItem.answer ? newQrItem.answer[0] : null;

    setRepeatAnswers(updatedRepeatAnswers);
    onQrItemChange({
      ...createEmptyQrItem(qItem),
      answer: updatedRepeatAnswers.flatMap((repeatAnswer) =>
        repeatAnswer.answer ? [repeatAnswer.answer] : []
      )
    });
  }

  function handleDeleteItem(index: number) {
    const updatedRepeatAnswers = [...repeatAnswers];

    updatedRepeatAnswers.splice(index, 1);

    setRepeatAnswers(updatedRepeatAnswers);
    onQrItemChange({
      ...createEmptyQrItem(qItem),
      answer: updatedRepeatAnswers.flatMap((repeatAnswer) =>
        repeatAnswer.answer ? [repeatAnswer.answer] : []
      )
    });
  }

  function handleAddItem() {
    setRepeatAnswers([
      ...repeatAnswers,
      {
        nanoId: nanoid(),
        answer: null
      }
    ]);
  }

  if (showMinimalView) {
    return (
      <>
        {repeatAnswers.map(({ nanoId, answer }, index) => {
          const repeatAnswerQrItem = createEmptyQrItem(qItem);
          if (answer) {
            repeatAnswerQrItem.answer = [answer];
          }

          return (
            <RepeatField
              key={nanoId}
              qItem={qItem}
              qrItem={repeatAnswerQrItem}
              answer={answer}
              numOfRepeatAnswers={repeatAnswers.length}
              parentIsReadOnly={parentIsReadOnly}
              showMinimalView={showMinimalView}
              onDeleteAnswer={() => handleDeleteItem(index)}
              onQrItemChange={(newQrItem) => handleAnswerChange(newQrItem, index)}
            />
          );
        })}
      </>
    );
  }

  return (
    <FullWidthFormComponentBox data-test="q-item-repeat-box">
      <ItemFieldGrid qItem={qItem} displayInstructions={displayInstructions} readOnly={readOnly}>
        <TransitionGroup>
          {repeatAnswers.map(({ nanoId, answer }, index) => {
            const repeatAnswerQrItem = createEmptyQrItem(qItem);
            if (answer) {
              repeatAnswerQrItem.answer = [answer];
            }

            return (
              <Collapse key={nanoId} timeout={200}>
                <RepeatField
                  qItem={qItem}
                  qrItem={repeatAnswerQrItem}
                  answer={answer}
                  numOfRepeatAnswers={repeatAnswers.length}
                  parentIsReadOnly={parentIsReadOnly}
                  showMinimalView={showMinimalView}
                  onDeleteAnswer={() => handleDeleteItem(index)}
                  onQrItemChange={(newQrItem) => handleAnswerChange(newQrItem, index)}
                />
              </Collapse>
            );
          })}
        </TransitionGroup>
      </ItemFieldGrid>

      <AddItemButton repeatAnswers={repeatAnswers} readOnly={readOnly} onAddItem={handleAddItem} />
    </FullWidthFormComponentBox>
  );
}

export default RepeatItem;
