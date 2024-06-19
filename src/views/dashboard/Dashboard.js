import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DataTableComponent from '../../components/DataTable'
import BadgeStatus from '../../components/BadgeStatus'
import { fetchData } from '../../../src/utils/firestoreUtils'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

const handlePreviewResult = (row) => {
  if (row.result) {
    MySwal.fire({
      title: 'Hasil Radiologi',
      html: <iframe src={row.result} width="100%" height="500px" frameBorder="0" allowFullScreen />,
    })
  } else {
    MySwal.fire({
      title: 'Error',
      text: 'Data belum tersedia',
      icon: 'error',
    })
  }
}

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
    cell: (row) =>
      row.result ? (
        <button
          className="btn btn-primary"
          onClick={() => {
            handlePreviewResult()
          }}
        >
          Lihat Hasil
        </button>
      ) : (
        'Data belum tersedia'
      ),
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
    field: 'nama_pasien',
    placeholder: 'Cari Nama Pasien',
  }

  return (
    <div>
      <DataTableComponent columns={columns} data={data} searchOptions={searchOptions} />
    </div>
  )
}

export default Dashboard
