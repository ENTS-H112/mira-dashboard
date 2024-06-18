// Import necessary libraries
import { CButton } from '@coreui/react'
import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

const TambahLaporan = () => {
  const { id } = useParams() // Ambil ID pasien dari URL menggunakan useParams
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

  // Fungsi untuk menangani pengajuan laporan
  const handleSubmit = async () => {
    const formData = new FormData()
    formData.append('image', image) // Sertakan file gambar dalam FormData
    formData.append('notes', notes) // Sertakan catatan pengguna dalam FormData

    try {
      console.log('Submitting request to predict:', id) // Tampilkan ID pasien yang sedang diprediksi
      const response = await axios.post(
        `https://expres-mira-ml-abwswzd4sa-et.a.run.app/predict/${id}`, // Gunakan URL backend yang benar
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      )
      console.log('Prediction response:', response.data)
      setResult(response.data.data) // Perbarui state result dengan data prediksi dari server
    } catch (error) {
      if (error.response) {
        // Tanggapan dari server dengan kode status tertentu
        console.log('Server responded with error status:', error.response.status)
        console.log('Server responded with error data:', error.response.data)
      } else if (error.request) {
        // Permintaan dibuat tetapi tidak ada tanggapan yang diterima
        console.log('Request made but no response received:', error.request)
      } else {
        // Kesalahan dalam menyiapkan permintaan
        console.log('Error during request setup:', error.message)
      }
      console.error('Axios error:', error)
      // Handle error display or other actions here
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
        {result && (
          <div className="result">
            <h2>Prediction Result:</h2>
            <p>{result.explanation}</p>
            <p>Suggestion: {result.suggestion}</p>
            <p>Confidence Score: {result.confidenceScore}</p>
            <p>Result: {result.result}</p>
          </div>
        )}
        <CButton color="danger" onClick={handleBackClick}>
          Kembali
        </CButton>
      </div>
    </div>
  )
}

export default TambahLaporan
