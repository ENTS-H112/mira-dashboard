import { CButton } from '@coreui/react'
import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { v4 as uuidv4 } from 'uuid'
import jsPDF from 'jspdf'
import { db } from '../../../../src/config/firestore'

const MySwal = withReactContent(Swal)

const TambahLaporan = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [image, setImage] = useState(null)
  const [result, setResult] = useState(null)
  const [notes, setNotes] = useState('')

  // Fungsi untuk menampilkan peringatan ketika pengguna ingin kembali
  const handleBackClick = () => {
    MySwal.fire({
      title: 'Anda yakin ingin kembali?',
      text: 'Perubahan yang Anda buat mungkin tidak akan disimpan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, kembali',
      cancelButtonText: 'Tidak, tetap di sini',
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/laporan')
      }
    })
  }

  // Fungsi untuk mengubah nilai gambar saat pengguna memilih file
  const handleImageChange = (e) => {
    setImage(e.target.files[0])
  }

  // Fungsi untuk mengubah catatan pengguna
  const handleNotesChange = (e) => {
    setNotes(e.target.value)
  }

  // Fungsi untuk menghasilkan dan mengunggah PDF
  const handleGenerateAndUploadPdf = async () => {
    const docRef = doc(db, 'pasien', id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const patientData = docSnap.data()

      const doc = new jsPDF()

      doc.setFontSize(12)
      doc.text('Detail Pasien', 10, 10)
      doc.text(`Nama: ${patientData.nama_pasien}`, 10, 20)
      doc.text(`Umur: ${patientData.usia}`, 10, 30)
      doc.text(`Jenis Kelamin: ${patientData.gender}`, 10, 40)
      doc.text(`Alamat: ${patientData.alamat}`, 10, 50)
      doc.text(`Jenis Periksa: ${patientData.jenis_periksa}`, 10, 60)
      doc.text(`Waktu Kunjungan: ${patientData.tanggal_kunjungan}`, 10, 70)

      if (result) {
        doc.text('Hasil Prediksi', 10, 90)
        doc.text(`Explanation: ${result.explanation}`, 10, 100)
        doc.text(`Suggestion: ${result.suggestion}`, 10, 110)
        doc.text(`Confidence Score: ${result.confidenceScore}`, 10, 120)
        doc.text(`Result: ${result.result}`, 10, 130)
      }

      const pdfBlob = doc.output('blob')

      const storage = getStorage()
      const fileName = `result/${uuidv4()}.pdf`
      const storageRef = ref(storage, fileName)

      await uploadBytes(storageRef, pdfBlob)

      const fileUrl = await getDownloadURL(storageRef)

      await updateDoc(docRef, { result: fileUrl, status_hasil: true, status: 'Selesai' })

      MySwal.fire({
        title: 'PDF berhasil diunggah',
        text: 'PDF telah berhasil diunggah ke server.',
        icon: 'success',
      })
    } else {
      console.log('No such document!')
      MySwal.fire({
        title: 'Error',
        text: 'Data pasien tidak ditemukan.',
        icon: 'error',
      })
    }
  }

  // Fungsi untuk menangani pengajuan laporan
  const handleSubmit = async () => {
    const formData = new FormData()
    formData.append('image', image)
    formData.append('notes', notes)

    MySwal.fire({
      title: 'Tunggu sebentar...',
      text: 'Sedang memproses laporan Anda',
      allowOutsideClick: false,
      didOpen: () => {
        MySwal.showLoading()
      },
    })

    try {
      const response = await axios.post(
        `https://expres-mira-ml-abwswzd4sa-et.a.run.app/predict/${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      )
      setResult(response.data.data)

      MySwal.fire({
        title: 'Hasil Prediksi',
        html: `
          <p><strong>Explanation:</strong> ${response.data.data.explanation}</p>
          <p><strong>Suggestion:</strong> ${response.data.data.suggestion}</p>
          <p><strong>Confidence Score:</strong> ${response.data.data.confidenceScore}</p>
          <p><strong>Result:</strong> ${response.data.data.result}</p>
        `,
        icon: 'success',
        confirmButtonText: 'Generate PDF',
      }).then((result) => {
        if (result.isConfirmed) {
          handleGenerateAndUploadPdf()
        }
      })
    } catch (error) {
      let errorMessage = 'Terjadi kesalahan saat mengirim laporan.'
      if (error.response) {
        errorMessage = `Error: ${error.response.data.message || errorMessage}`
      } else if (error.request) {
        errorMessage = 'Tidak ada respon dari server.'
      } else {
        errorMessage = `Error: ${error.message}`
      }

      MySwal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        showCancelButton: true,
        cancelButtonText: 'Batal',
        confirmButtonText: 'Ulangi Lagi',
      }).then((result) => {
        if (result.isConfirmed) {
          handleSubmit()
        }
      })
    }
  }

  return (
    <div>
      <h1>Tambah Laporan untuk Pasien ID: {id}</h1>
      <div className="form-group gap-2 d-flex flex-column">
        <label htmlFor="exampleFormControlTextarea1">Catatan</label>
        <textarea
          className="form-control"
          id="exampleFormControlTextarea1"
          rows="3"
          value={notes}
          onChange={handleNotesChange}
        ></textarea>
        <label htmlFor="formFile">Hasil Pemeriksaan</label>
        <input className="form-control" type="file" id="formFile" onChange={handleImageChange} />
        <CButton color="primary" onClick={handleSubmit}>
          Submit
        </CButton>
        <CButton color="danger" onClick={handleBackClick}>
          Kembali
        </CButton>
      </div>
    </div>
  )
}

export default TambahLaporan
