import { CButton, CCard, CCardBody, CCardHeader, CCardText, CCardTitle } from '@coreui/react'
import { doc, getDoc } from 'firebase/firestore'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import hospitalLogo from '../../../../src/assets/images/logomira.jpeg' // Import logo dari folder assets
import { db } from '../../../../src/config/firestore'

const Detail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [selectedData, setSelectedData] = useState(null)
  const [predictionData, setPredictionData] = useState(null)
  const hospitalLogoUrl = hospitalLogo.default // Menggunakan require untuk logo rumah sakit

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, 'pasien', id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        setSelectedData({ ...docSnap.data(), id: docSnap.id })
        fetchPredictionData(docSnap.id)
      } else {
        console.log('No such document!')
      }
    }

    const fetchPredictionData = async (patientId) => {
      const predictionRef = doc(db, 'predictions', patientId)
      const predictionSnap = await getDoc(predictionRef)

      if (predictionSnap.exists()) {
        setPredictionData(predictionSnap.data())
      } else {
        console.log('No prediction data found for this patient ID!')
      }
    }

    fetchData()
  }, [id])

  const handleExportToPDF = async () => {
    const doc = new jsPDF()

    // Header Rumah Sakit
    const hospitalName = 'Rumah Sakit Mira'
    const hospitalAddress = 'Jl. Kesehatan No. 1, Jakarta'
    const doctorName = 'Dr. Budi Santoso'

    try {
      const base64HospitalLogo = await fetchImageAsBase64(hospitalLogoUrl)
      doc.addImage(base64HospitalLogo, 'JPEG', 20, 10, 50, 50)
    } catch (error) {
      console.error('Failed to fetch and add logo to PDF:', error)
    }

    doc.setFontSize(18)
    doc.text(hospitalName, 80, 30)
    doc.setFontSize(12)
    doc.text(hospitalAddress, 80, 40)
    doc.text(`Dokter: ${doctorName}`, 80, 50)

    // Detail Pasien
    doc.setFontSize(14)
    doc.text('Detail Pasien', 20, 70)

    const patientDetails = [
      ['Status', selectedData.status],
      ['No. Antrian', selectedData.nomor_antrian],
      ['Nama Pasien', selectedData.nama_pasien],
      ['Alamat', selectedData.alamat],
      ['Usia', selectedData.usia],
      [
        'Jadwal Kunjungan',
        selectedData.waktu ? selectedData.waktu.toDate().toString() : 'No date available',
      ],
    ]

    doc.autoTable({
      startY: 80,
      head: [['Key', 'Value']],
      body: patientDetails,
    })

    if (predictionData) {
      doc.setFontSize(14)
      doc.text('Hasil Pemeriksaan Radiologi', 20, doc.autoTable.previous.finalY + 10)

      const examinationDetails = [
        ['Prediction Result', predictionData.explanation],
        ['Suggestion', predictionData.suggestion],
        ['Confidence Score', predictionData.confidenceScore],
        ['Result', predictionData.result],
      ]

      doc.autoTable({
        startY: doc.autoTable.previous.finalY + 20,
        head: [['Key', 'Value']],
        body: examinationDetails,
      })

      // Add image if available
      if (predictionData.imageUrl) {
        try {
          const base64Image = await fetchImageAsBase64(predictionData.imageUrl)
          doc.addImage(base64Image, 'JPEG', 20, doc.autoTable.previous.finalY + 20, 160, 90)
        } catch (error) {
          console.error('Failed to fetch and add image to PDF:', error)
        }
      }
    }

    doc.save('DetailPasien.pdf')
  }

  return (
    <div>
      <button onClick={() => navigate('/pasien')} className="btn btn-primary my-2">
        Back to Pasien
      </button>
      {selectedData ? (
        <div>
          <CCard>
            <CCardHeader>Detail Pasien</CCardHeader>
            <CCardBody>
              <CCardTitle>Status: {selectedData.status}</CCardTitle>
              <CCardText>No. Antrian: {selectedData.nomor_antrian}</CCardText>
              <CCardText>Nama Pasien: {selectedData.nama_pasien}</CCardText>
              <CCardText>Alamat: {selectedData.alamat}</CCardText>
              <CCardText>Usia: {selectedData.usia}</CCardText>
              <CCardText>
                Jadwal Kunjungan:{' '}
                {selectedData.waktu ? selectedData.waktu.toDate().toString() : 'No date available'}
              </CCardText>
            </CCardBody>
          </CCard>
          {predictionData && (
            <CCard className="mt-4">
              <CCardHeader>Hasil Pemeriksaan Radiologi</CCardHeader>
              <CCardBody>
                <CCardText>Prediction Result: {predictionData.explanation}</CCardText>
                <CCardText>Suggestion: {predictionData.suggestion}</CCardText>
                <CCardText>Confidence Score: {predictionData.confidenceScore}</CCardText>
                <CCardText>Result: {predictionData.result}</CCardText>
                {predictionData.imageUrl && (
                  <div>
                    <img
                      src={predictionData.imageUrl}
                      alt="Examination Result"
                      style={{ maxWidth: '100%' }}
                    />
                  </div>
                )}
              </CCardBody>
            </CCard>
          )}
          <CButton color="primary" onClick={handleExportToPDF} className="mt-4">
            Export to PDF
          </CButton>
        </div>
      ) : (
        <p>No data found for this ID</p>
      )}
    </div>
  )
}

export default Detail
