import { format, parse } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchData } from '../../../src/utils/firestoreUtils'
import BadgeStatus from '../../components/BadgeStatus'
import DataTableComponent from '../../components/DataTable'

const columns = (navigate, reloadData) => [
  {
    name: 'Nama Pasien',
    selector: (row) => row.nama_pasien,
  },
  {
    name: 'Jadwal Kunjungan',
    cell: (row) => {
      let formattedDate = 'No date available'
      try {
        if (row.tanggal_kunjungan) {
          const parsedDate = parse(row.tanggal_kunjungan, 'yyyy/MM/dd', new Date())
          if (!isNaN(parsedDate)) {
            formattedDate = format(parsedDate, 'PPPP', { locale: localeId })
          }
        }
      } catch (error) {
        console.error('Error formatting date:', error)
      }
      return <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>{formattedDate}</div>
    },
  },
  {
    name: 'Status',
    cell: (row) => <BadgeStatus status={row.status} />,
  },
  {
    name: 'Hasil Radiologi',
    cell: (row) => row.hasil_radiologi,
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
