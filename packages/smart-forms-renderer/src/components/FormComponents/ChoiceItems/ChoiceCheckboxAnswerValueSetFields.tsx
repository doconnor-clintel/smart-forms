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
import { ChoiceItemOrientation } from '../../../interfaces/choice.enum';
import type { Coding, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import CheckboxSingle from '../ItemParts/CheckboxSingle';
import { StyledFormGroup } from '../Item.styles';
import { StyledAlert } from '../../Alert.styles';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Typography from '@mui/material/Typography';

interface ChoiceCheckboxAnswerValueSetFieldsProps {
  codings: Coding[];
  answers: QuestionnaireResponseItemAnswer[];
  orientation: ChoiceItemOrientation;
  readOnly: boolean;
  serverError: Error | null;
  onCheckedChange: (newValue: string) => void;
}

function ChoiceCheckboxAnswerValueSetFields(props: ChoiceCheckboxAnswerValueSetFieldsProps) {
  const { codings, answers, orientation, readOnly, serverError, onCheckedChange } = props;

  if (codings.length > 0) {
    return (
      <StyledFormGroup row={orientation === ChoiceItemOrientation.Horizontal}>
        {codings.map((coding) => (
          <CheckboxSingle
            key={coding.code ?? ''}
            value={coding.code ?? ''}
            label={coding.display ?? `${coding.code}`}
            readOnly={readOnly}
            isChecked={answers.some(
              (answer) => JSON.stringify(answer.valueCoding) === JSON.stringify(coding)
            )}
            onCheckedChange={onCheckedChange}
          />
        ))}
      </StyledFormGroup>
    );
  }

  if (serverError) {
    return (
      <StyledAlert color="error">
        <ErrorOutlineIcon color="error" sx={{ pr: 0.75 }} />
        <Typography variant="subtitle2">
          There was an error fetching options from the terminology server
        </Typography>
      </StyledAlert>
    );
  }

  return (
    <StyledAlert color="error">
      <ErrorOutlineIcon color="error" sx={{ pr: 0.75 }} />
      <Typography variant="subtitle2">
        Unable to fetch options from the questionnaire or launch context
      </Typography>
    </StyledAlert>
  );
}

export default ChoiceCheckboxAnswerValueSetFields;
