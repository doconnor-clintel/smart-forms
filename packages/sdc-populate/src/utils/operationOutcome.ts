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

import type { OperationOutcome, OperationOutcomeIssue } from 'fhir/r4';

export function createErrorOutcome(errorMessage: string): OperationOutcome {
  return {
    resourceType: 'OperationOutcome',
    issue: [
      {
        severity: 'error',
        code: 'invalid',
        details: { text: errorMessage }
      }
    ]
  };
}

/**
 * Create an OperationOutcome issue of severity warning with a supplied warning message
 *
 * @author Sean Fong
 */
export function createWarningIssue(warningMessage: string): OperationOutcomeIssue {
  return {
    severity: 'warning',
    code: 'invalid',
    details: { text: warningMessage }
  };
}
