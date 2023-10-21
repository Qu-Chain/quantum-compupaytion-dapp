import { ReactNode, useRef, ChangeEvent, useState } from 'react'
import { Button, FormControl, FormErrorMessage, FormLabel, Icon, InputGroup } from '@chakra-ui/react'
import { useForm, UseFormRegisterReturn } from 'react-hook-form'
import { FiFile } from 'react-icons/fi'

type FileUploadProps = {
  register: UseFormRegisterReturn
  accept?: string
  children?: ReactNode
}

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
  file_: File
}

export function Upload() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()
  const [fileContents, setFileContents] = useState('')
  const [title, setTitle] = useState('')

  const onSubmit = handleSubmit((data) => {
    const selectedFile = readFileAsText(data.file_[0])
      .then((fileContents) => {
        console.log(fileContents)
        setFileContents(fileContents)
        setTitle('Your Circuit')
      })
      .catch((error) => {
        console.error(error)
      })
    console.log('On Submit: ', data)
    console.log('Selected file: ', selectedFile)

    // set the selected file to a local state variable here.
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
        <FormControl isInvalid={!!errors.file_} isRequired>
          <FormLabel>{'File input'}</FormLabel>
          <FileUpload
            accept='.qasm' // accepts .qasm files only
            register={register('file_', { validate: validateFiles })}>
            <Button leftIcon={<Icon as={FiFile} />}>Upload your QASM file</Button>
          </FileUpload>

          <FormErrorMessage>{errors.file_ && errors?.file_.message}</FormErrorMessage>
        </FormControl>
        <button>Upload Circuit</button>
      </form>
      <div>
        <h2>{title}</h2>
        <p>{fileContents}</p>
      </div>
    </>
  )
}

export function getCircuitString(useState: any, fileContents: string) {
  return fileContents
}
