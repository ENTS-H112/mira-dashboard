import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DataTableComponent from '../../components/DataTable'
import BadgeStatus from '../../components/BadgeStatus'
import { fetchData } from '../../../src/utils/firestoreUtils'

const columns = () => [
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

const Jadwal = () => {
  const navigate = useNavigate()
  const [data, setData] = useState([])

  const loadData = async () => {
    const fetchedData = await fetchData('pasien')
    setData(fetchedData)
  }

  const reloadData = () => {
    loadData()
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div>
      <DataTableComponent columns={columns(navigate, reloadData)} data={data} />
    </div>
  )
}

export default Jadwal
