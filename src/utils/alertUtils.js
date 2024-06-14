import React, { useState } from 'react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import DateTimePicker from '../components/DateTimePicker'

const MySwal = withReactContent(Swal)

export const showSuccessAlert = (message) => {
  Swal.fire({
    position: 'top-center',
    icon: 'success',
    title: message,
    showConfirmButton: false,
    timer: 1500,
  })
}

export const showErrorAlert = (message) => {
  Swal.fire({
    position: 'top-center',
    icon: 'error',
    title: 'Oops...',
    text: message,
    footer: '<a href="#">Why do I have this issue?</a>',
  })
}

export const showConfirmAlert = async (title, text) => {
  const { isConfirmed } = await MySwal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya',
    cancelButtonText: 'Tidak',
  })

  return isConfirmed
}

export const showDateInputAlert = async (title, inputLabel) => {
  let selectedDate = null

  await MySwal.fire({
    title,
    html: (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <label>{inputLabel}</label>
        <DateTimePickerWrapper setSelectedDate={(date) => (selectedDate = date)} />
      </div>
    ),
    showCancelButton: true,
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    preConfirm: () => {
      return selectedDate
    },
  })

  return selectedDate
}

// eslint-disable-next-line react/prop-types
const DateTimePickerWrapper = ({ setSelectedDate }) => {
  const [selectedDate, setLocalSelectedDate] = useState(null)

  const handleDateChange = (date) => {
    setLocalSelectedDate(date)
    setSelectedDate(date)
  }

  return <DateTimePicker selectedDate={selectedDate} setSelectedDate={handleDateChange} />
}
