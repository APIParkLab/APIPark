
import {forwardRef} from 'react';
import type { PickerProps } from 'antd/es/date-picker/generatePicker';
import type { Moment } from 'moment';

import DatePicker from './DatePicker';

export interface TimePickerProps extends Omit<PickerProps<Moment>, 'picker'> {}

const TimePicker = forwardRef<unknown, TimePickerProps>((props, ref) => (
  <DatePicker {...props} picker="time" mode={undefined} ref={ref} />
));

TimePicker.displayName = 'TimePicker';

export default TimePicker;