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

import type {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem
} from 'fhir/r4';
import { structuredDataCapture } from 'fhir-sdc-helpers';

export function removeEmptyAnswersFromResponse(
  questionnaire: Questionnaire,
  questionnaireResponse: QuestionnaireResponse
): QuestionnaireResponse {
  const topLevelQItems = questionnaire.item;
  const topLevelQRItems = questionnaireResponse.item;
  if (
    !topLevelQItems ||
    topLevelQItems.length === 0 ||
    !topLevelQRItems ||
    topLevelQRItems.length === 0
  ) {
    return questionnaireResponse;
  }

  for (const [i, topLevelQRItem] of topLevelQRItems.entries()) {
    const qItem = topLevelQItems[i];
    if (!qItem) {
      continue;
    }

    const newTopLevelQRItem = removeEmptyAnswersFromItemRecursive(qItem, topLevelQRItem);
    if (newTopLevelQRItem && questionnaireResponse.item) {
      questionnaireResponse.item[i] = { ...newTopLevelQRItem };
    }
  }

  return questionnaireResponse;
}

function removeEmptyAnswersFromItemRecursive(
  qItem: QuestionnaireItem,
  qrItem: QuestionnaireResponseItem
): QuestionnaireResponseItem | null {
  const qItems = qItem.item;
  const qrItems = qrItem.item;

  // Process group items
  if (qItems && qItems.length > 0) {
    // Return nothing if corresponding qItem is hidden
    if (structuredDataCapture.getHidden(qItem)) {
      return null;
    }

    if (qrItems && qrItems.length > 0) {
      const newQrItems: QuestionnaireResponseItem[] = [];

      // Loop over qItems - but end loop if we either reach the end of qItems or qrItems
      // Under normal circumstances we will reach the end of both arrays together
      for (
        let qItemIndex = 0, qrItemIndex = 0;
        qItemIndex < qItems.length || qrItemIndex < qrItems.length;
        qItemIndex++
      ) {
        const childQItem = qItems[qItemIndex];
        const childQrItem = qrItems[qrItemIndex];

        // Save qrItem if linkIds of current qItem and qrItem are the same
        if (childQItem && childQrItem && childQItem.linkId === childQrItem.linkId) {
          // if (!qItems[qrItemIndex]) {
          //   continue;
          // }

          const newQrItem = removeEmptyAnswersFromItemRecursive(childQItem, childQrItem);
          if (newQrItem) {
            newQrItems.push(newQrItem);
          }

          // Decrement qItem index if the next qrItem is an answer from a repeatGroup
          // Essentially persisting the current qItem linked to be matched up with the next qrItem linkId
          if (
            qrItems.length !== qrItemIndex + 1 &&
            childQrItem.linkId === qrItems[qrItemIndex + 1]?.linkId
          ) {
            qItemIndex--;
          }

          // Only Increment qrItem index whenever the current qrItem linkId matches up with the current qItem
          qrItemIndex++;
        }
      }
      return { ...qrItem, item: newQrItems };
    }

    // Also perform checks if answer exists
    return answerIsEmpty(qItem, qrItem) ? null : qrItem;
  }

  // Process non-group items
  return answerIsEmpty(qItem, qrItem) ? null : { ...qrItem };
}

function answerIsEmpty(qItem: QuestionnaireItem, qrItem: QuestionnaireResponseItem) {
  if (structuredDataCapture.getHidden(qItem)) {
    return true;
  }

  if (!qrItem.answer) {
    return true;
  }

  if (qrItem.answer[0]?.valueString === '') {
    return true;
  }

  return false;
}
