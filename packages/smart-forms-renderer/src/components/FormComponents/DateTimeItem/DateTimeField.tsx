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
import type { PropsWithIsTabledAttribute } from '../../../interfaces/renderProps.interface';
import type { Dayjs } from 'dayjs';
import { DateTimePicker as MuiDateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Box from '@mui/material/Box';

interface DateTimeFieldProps extends PropsWithIsTabledAttribute {
  value: Dayjs | null;
  displayPrompt: string;
  entryFormat: string;
  readOnly: boolean;
  onDateTimeChange: (newValue: Dayjs | null) => unknown;
}

function DateTimeField(props: DateTimeFieldProps) {
  const { value, displayPrompt, entryFormat, readOnly, isTabled, onDateTimeChange } = props;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box data-test="q-item-date-time-field">
        <MuiDateTimePicker
          format={entryFormat !== '' ? entryFormat : 'DD/MM/YYYY hh:mm A'}
          value={value}
          disabled={readOnly}
          label={displayPrompt}
          sx={{ maxWidth: !isTabled ? 280 : 3000, minWidth: 160 }}
          onChange={onDateTimeChange}
          slotProps={{
            textField: {
              size: 'small',
              fullWidth: true
            }
          }}
        />
      </Box>
    </LocalizationProvider>
  );
}

export default DateTimeField;
