import { doc, getDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../../../../src/config/firestore'

import { CCard, CCardBody, CCardHeader, CCardText, CCardTitle } from '@coreui/react'

const Detail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [selectedData, setSelectedData] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'pasien', id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setSelectedData({ ...docSnap.data(), id: docSnap.id })
        } else {
          console.log('No such document!')
        }
      } catch (error) {
        console.error('Error fetching document:', error)
      }
    }

    fetchData()
  }, [id])

  return (
    <div>
      <button onClick={() => navigate('/jadwal')} className="btn btn-primary my-2">
        Back to Jadwal
      </button>
      {selectedData ? (
        <div>
          <CCard>
            <CCardHeader>{selectedData.nama_pasien}</CCardHeader>
            <CCardBody>
              <CCardTitle>Status: {selectedData.status}</CCardTitle>
              <CCardText>No. Antrian: {selectedData.nomor_antrian}</CCardText>
              <CCardText>Nama Pasien: {selectedData.nama_pasien}</CCardText>
              <CCardText>Alamat: {selectedData.alamat}</CCardText>
              <CCardText>Usia: {selectedData.usia}</CCardText>
              <CCardText>
                Jadwal Kunjungan:
                {selectedData.tanggal_kunjungan
                  ? new Date(selectedData.tanggal_kunjungan).toDateString()
                  : 'No date available'}
              </CCardText>
            </CCardBody>
          </CCard>
        </div>
      ) : (
        <p>No data found for this ID</p>
      )}
    </div>
  )
}

export default Detail
