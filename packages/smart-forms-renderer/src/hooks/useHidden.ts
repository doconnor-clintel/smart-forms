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

import type { QuestionnaireItem } from 'fhir/r4';
import { useQuestionnaireStore } from '../stores';
import { isHiddenByEnableWhens } from '../utils/qItem';
import { structuredDataCapture } from 'fhir-sdc-helpers';

function useHidden(qItem: QuestionnaireItem): boolean {
  const enableWhenIsActivated = useQuestionnaireStore.use.enableWhenIsActivated();
  const enableWhenItems = useQuestionnaireStore.use.enableWhenItems();
  const enableWhenExpressions = useQuestionnaireStore.use.enableWhenExpressions();

  if (structuredDataCapture.getHidden(qItem)) {
    return true;
  }

  return isHiddenByEnableWhens({
    linkId: qItem.linkId,
    enableWhenIsActivated,
    enableWhenItems,
    enableWhenExpressions
  });
}

export default useHidden;
