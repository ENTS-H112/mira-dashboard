import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DataTableComponent from '../../components/DataTable'
import BadgeStatus from '../../components/BadgeStatus'
import { fetchData } from '../../../src/utils/firestoreUtils'

const columns = [
  {
    name: 'Nama Pasien',
    selector: (row) => row.nama_pasien,
  },
  {
    name: 'Jadwal Kunjungan',
    cell: (row) => (
      <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
        {row.hari_kunjungan && row.tanggal_kunjungan
          ? `${row.hari_kunjungan}, ${row.tanggal_kunjungan}`
          : 'No date'}
      </div>
    ),
  },
  {
    name: 'Status',
    cell: (row) => <BadgeStatus status={row.status} />,
  },
  {
    name: 'Hasil Radiologi',
    cell: (row) => (row.result ? <a href={row.result}>Lihat</a> : 'Data belum tersedia'),
  },
]

const Dashboard = () => {
  const navigate = useNavigate()
  const [data, setData] = useState([])

  const loadData = async () => {
    const fetchedData = await fetchData('pasien')
    setData(fetchedData)
  }

  useEffect(() => {
    loadData()
  }, [])

  const searchOptions = {
    field: 'nama_pasien', // Sesuaikan dengan field yang ingin Anda cari
    placeholder: 'Cari Nama Pasien', // Placeholder untuk input pencarian
  }

  return (
    <div>
      <DataTableComponent columns={columns} data={data} searchOptions={searchOptions} />
    </div>
  )
}

export default Dashboard
