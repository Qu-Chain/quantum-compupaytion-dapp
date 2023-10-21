import { Heading, ListItem, UnorderedList } from '@chakra-ui/react'
import { Head } from 'components/layout/Head'
import { Upload } from 'components/layout/FileUpload'
import { LinkComponent } from 'components/layout/LinkComponent'

export default function Home() {
  return (
    <>
      <Head />

      <main>
        <Heading as="h2">Upload your Quantum Circuit</Heading>
        <Upload />
        <LinkComponent href="/examples/send-ether">Send Ether transaction</LinkComponent>
      </main>
    </>
  )
}
