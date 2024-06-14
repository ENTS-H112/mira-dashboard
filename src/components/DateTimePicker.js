import React from 'react'
import PropTypes from 'prop-types'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import styled from 'styled-components'
import { registerLocale, setDefaultLocale } from 'react-datepicker'
import id from 'date-fns/locale/id'

// Register and set the default locale to Indonesian
registerLocale('id', id)
setDefaultLocale('id')

const DatePickerWrapper = styled.div`
  .react-datepicker-wrapper {
    width: 100%;
  }
  .react-datepicker__input-container {
    width: 100%;
  }
  input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ced4da;
    border-radius: 4px;
  }
`

const DateTimePicker = ({ selectedDate, setSelectedDate }) => {
  return (
    <DatePickerWrapper>
      <DatePicker
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        showTimeSelect
        dateFormat="Pp"
        timeFormat="HH:mm"
        timeIntervals={15}
        placeholderText="Pilih tanggal dan waktu"
        locale="id" // Set the locale to Indonesian
      />
    </DatePickerWrapper>
  )
}

DateTimePicker.propTypes = {
  selectedDate: PropTypes.instanceOf(Date),
  setSelectedDate: PropTypes.func.isRequired,
}

export default DateTimePicker
