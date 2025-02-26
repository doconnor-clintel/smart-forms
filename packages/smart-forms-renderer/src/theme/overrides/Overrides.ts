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

import Card from './Card';
import Paper from './Paper';
import Input from './Input';
import Table from './Table';
import Button from './Button';
import Autocomplete from './Autocomplete';
import Accordion from './Accordion';
import SpeedDial from './SpeedDial';
import type { Theme } from '@mui/material/styles';

function ComponentsOverrides(theme: Theme) {
  return Object.assign(
    Accordion(theme),
    Card(theme),
    Table(theme),
    Input(theme),
    Paper(),
    Button(theme),
    Autocomplete(theme),
    SpeedDial(theme)
  );
}

export default ComponentsOverrides;
