import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DataTableComponent from '../../../../src/components/DataTable'
import BadgeStatus from '../../../../src/components/BadgeStatus'
import { fetchData, updateDocument } from '../../../../src/utils/firestoreUtils'
import { showSuccessAlert, showDateInputAlert } from '../../../../src/utils/alertUtils'
import { format } from 'date-fns'

const rescheduleAppointment = async (id, reloadData) => {
  const date = await showDateInputAlert('Pilih tanggal baru', 'Jadwal baru')
  if (date) {
    const formattedDate = date.toISOString().split('T')[0]
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const endTime = new Date(date)
    endTime.setHours(hours + 1)

    const formattedStartTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    const formattedEndTime = `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`

    await updateDocument('pasien', id, {
      tanggal_kunjungan: formattedDate,
      hari_kunjungan: format(date, 'EEEE'),
      jam_kunjungan: `${formattedStartTime}-${formattedEndTime}`,
    })
    await updateDocument('pasien', id, { status: 'Jadwal Ulang' })
    showSuccessAlert('Berhasil menjadwal ulang!')
    reloadData()
  }
}

const confirmAppointment = async (id, reloadData) => {
  await updateDocument('pasien', id, { status: 'Konfirmasi' })
  showSuccessAlert('Berhasil mengkonfirmasi jadwal!')
  reloadData()
}

const translateDayToIndonesian = (day) => {
  const daysInIndonesian = {
    Sunday: 'Minggu',
    Monday: 'Senin',
    Tuesday: 'Selasa',
    Wednesday: 'Rabu',
    Thursday: 'Kamis',
    Friday: 'Jumat',
    Saturday: 'Sabtu',
  }
  return daysInIndonesian[day] || day
}

const columns = (navigate, reloadData) => [
  {
    name: 'No. Antrian',
    selector: (row) => row.nomor_antrian,
    sortable: true,
  },
  {
    name: 'Nama Pasien',
    selector: (row) => row.nama_pasien,
    sortable: true,
  },
  {
    name: 'Tanggal Kunjungan',
    cell: (row) => (
      <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
        {row.hari_kunjungan && row.tanggal_kunjungan
          ? `${translateDayToIndonesian(row.hari_kunjungan)}, ${row.tanggal_kunjungan}`
          : 'No date'}
      </div>
    ),
    sortable: true,
  },
  {
    name: 'Jam Kunjungan',
    selector: (row) => row.jam_kunjungan,
    sortable: true,
  },
  {
    name: 'Status',
    cell: (row) => <BadgeStatus status={row.status} />,
    sortable: true,
  },
  {
    name: 'Action',
    cell: (row) => (
      <div>
        <button
          className="btn btn-secondary text-white m-1"
          onClick={() => navigate(`/jadwal/${row.id}`)}
        >
          Detail
        </button>
        <button
          className="btn btn-success text-white m-1"
          onClick={() => confirmAppointment(row.id, reloadData)}
        >
          Konfirmasi
        </button>
        <button
          className="btn btn-warning text-white m-1"
          onClick={() => rescheduleAppointment(row.id, reloadData)}
        >
          Jadwal Ulang
        </button>
      </div>
    ),
  },
]

const Jadwal = () => {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [searchName, setSearchName] = useState('')

  const loadData = async () => {
    const fetchedData = await fetchData('pasien')
    let filteredData = fetchedData.filter((row) => {
      if (statusFilter) {
        return row.status === statusFilter && row.status !== 'Selesai'
      }
      return row.status !== 'Selesai'
    })

    if (searchName) {
      filteredData = filteredData.filter((row) =>
        row.nama_pasien.toLowerCase().includes(searchName.toLowerCase()),
      )
    }

    const sortedData = filteredData.sort((a, b) => {
      const dateA = new Date(a.tanggal_kunjungan + ' ' + a.jam_kunjungan)
      const dateB = new Date(b.tanggal_kunjungan + ' ' + b.jam_kunjungan)
      return dateA - dateB
    })

    setData(sortedData)
  }

  const reloadData = () => {
    loadData()
  }

  useEffect(() => {
    loadData()
  }, [statusFilter, searchName])

  const filterOptions = {
    field: 'status',
    allLabel: 'Semua Status',
    options: [
      { value: 'Konfirmasi', label: 'Konfirmasi' },
      { value: 'Jadwal Ulang', label: 'Jadwal Ulang' },
      { value: 'Menunggu Konfirmasi', label: 'Menunggu Konfirmasi' },
    ],
  }

  const searchOptions = {
    field: 'nama_pasien',
    placeholder: 'Cari Nama Pasien',
  }

  return (
    <div>
      <DataTableComponent
        columns={columns(navigate, reloadData)}
        data={data}
        filterOptions={filterOptions}
        searchOptions={searchOptions}
        onFilterChange={setStatusFilter}
        onSearchChange={setSearchName}
      />
    </div>
  )
}

export default Jadwal
