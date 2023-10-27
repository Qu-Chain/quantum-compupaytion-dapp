import React, { createContext, useContext, ReactNode, useRef, ChangeEvent, useState } from 'react'
import { Button, FormControl, FormErrorMessage, FormLabel, Icon, InputGroup } from '@chakra-ui/react'
import { useForm, UseFormRegisterReturn } from 'react-hook-form'
import { FiFile } from 'react-icons/fi'
import { useCircuitContext } from 'components/layout/CircuitContext'
import { fetchQiskitDataFromApi } from 'pages/api/qiskitAPI'

type FileUploadProps = {
  register: UseFormRegisterReturn
  accept?: string
  children?: ReactNode
}

// Function to read a file as text
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'))
      return
    }

    const reader = new FileReader()

    reader.addEventListener('load', () => {
      const fileContents = reader.result as string
      resolve(fileContents)
    })

    reader.addEventListener('error', () => {
      reject(new Error('Error reading the file'))
    })

    reader.readAsText(file)
  })
}

// FileUpload component
const FileUpload = (props: FileUploadProps) => {
  const { register, accept, children } = props
  const inputRef = useRef<HTMLInputElement | null>(null)
  const { ref, ...rest } = register as { ref: (instance: HTMLInputElement | null) => void }

  const handleClick = () => inputRef.current?.click()

  return (
    <InputGroup onClick={handleClick}>
      <input
        type={'file'}
        hidden
        accept={accept}
        {...rest}
        ref={(e) => {
          ref(e)
          inputRef.current = e
        }}
      />
      <>{children}</>
    </InputGroup>
  )
}
type FormValues = {
  file: File
}

export function Upload() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()
  const [CircuitString, setCircuitString] = useState('')
  const { circuit, setCircuit } = useCircuitContext()
  const [imgURL, setImg] = useState('')
  const [title, setTitle] = useState('')

  const onSubmit = handleSubmit((data) => {
    if (!data.file ) return
    const selectedFile = readFileAsText(data.file[0] as File)
      .then((fileContents) => {
        console.log(fileContents)
        setCircuitString(fileContents)
        setCircuit(fileContents)
        setTitle('Your Circuit')
        //TODO currently can't render image
        const imgPromise = fetchQiskitDataFromApi(fileContents)
        imgPromise
          .then((resolvedValue) => {
            // Do something with the resolved value
            const imageBlob = resolvedValue
            const blob = new Blob(imageBlob, { type: 'image/png' }) // the blob
            const imageObjectURL = URL.createObjectURL(blob)
            console.log(imageObjectURL)
            setImg(imageObjectURL)
          })
          .catch((error) => {
            // Handle any errors that occurred during the promise execution
            console.log(error)
          })
      })
      .catch((error) => {
        console.error(error)
      })
    console.log('On Submit: ', data)
    console.log('Selected file: ', selectedFile)
  })

  const validateFiles = (value: File) => {
    if (value.length < 1) {
      return 'File is required'
    }
    const file = value
    const fsMb = file.size / (1024 * 1024)
    const MAX_FILE_SIZE = 1
    if (fsMb > MAX_FILE_SIZE) {
      return 'Max file size 1mb'
    }
    return true
  }

  return (
    <>
      <form onSubmit={onSubmit}>
        <FormControl isInvalid={!!errors.file} isRequired>
          <FormLabel>{'File input'}</FormLabel>
          <FileUpload
            accept='.qasm' // accepts .qasm files only
            register={register('file', { validate: validateFiles })}>
            <Button leftIcon={<Icon as={FiFile} />}>Upload your QASM file</Button>
          </FileUpload>

          <FormErrorMessage>{errors.file && errors?.file.message}</FormErrorMessage>
        </FormControl>
        <button>Upload Circuit</button>
      </form>
      <div>
        <h2>{title}</h2>
        <p>
          {CircuitString.split('\n').map((el) => (
            <React.Fragment key={el}>
              {el}
              <br />
            </React.Fragment>
          ))}
        </p>
        <div>
          {imgURL && <img src={imgURL} />}
          {!imgURL && <p>Loading...</p>}
        </div>
      </div>
      <div>{}</div>
    </>
  )
}
