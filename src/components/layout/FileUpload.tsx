import { ReactNode, useRef, ChangeEvent, useState } from 'react'
import { Button, FormControl, FormErrorMessage, FormLabel, Icon, InputGroup } from '@chakra-ui/react'
import { useForm, UseFormRegisterReturn } from 'react-hook-form'
import { FiFile } from 'react-icons/fi'

type FileUploadProps = {
  register: UseFormRegisterReturn
  accept?: string
  children?: ReactNode
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const onSubmit = handleSubmit((data) => {
    const selectedFile = data.file_[0]
    console.log('On Submit: ', data)
    console.log('Selected file: ', selectedFile)

    // set the selected file to a local state variable here.
    setSelectedFile(selectedFile)
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
        <button>Submit</button>
      </form>
    </>
  )
}
