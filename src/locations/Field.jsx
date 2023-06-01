import React, { useState, useEffect } from 'react';
import { RichTextEditor } from '@contentful/field-editor-rich-text';
import { Form, FormControl, Button, Text, Note, TextLink } from '@contentful/f36-components';
import { useSDK, useAutoResizer } from '@contentful/react-apps-toolkit';


const Field = () => {
  let sdk = useSDK();

  const [mediaName, setMediaName] = useState()
  const [adviceErrorNotes, setAdviceErrorNotes] = useState([])  // custom notes when specific validation errors are present

  useAutoResizer()

  const openDialog = async () => {
    // enableAssetValidation().then(isAssetEnabled => setDidUpdateAssetEnable(isAssetEnabled))
    const blog_data = await sdk.dialogs.openCurrentApp({
      width: 700,
      title: "Contenda Blog Search",
      allowHeightOverflow: true,
      shouldCloseOnEscapePress: true,
      shouldCloseOnOverlayClick: true
    })
    if (blog_data) {
      setResultDocument(blog_data)
    }
  }

  const setResultDocument = async (blog) => {
    let resultDocument = {
      "nodeType": "document",
      "data": {}
    }
    let resultContent = []
    for (let segment of blog.segments) {
      let node
      if (segment.segment_type === "heading" || segment.segment_type === "user_heading") {
        node = {
          "nodeType": "heading-1",
          data: {},
          "content": [
            {
              "nodeType": "text",
              "value": segment.text,
              "marks": [],
              "data": {}
            }
          ]
        }
      } else if (segment.segment_type === "body" || segment.segment_type === "user_body") {
        node = {
          "nodeType": "paragraph",
          data: {},
          "content": [
            {
              "nodeType": "text",
              "value": segment.text,
              "marks": [],
              "data": {}
            }
          ]
        }
      } else if (segment.segment_type === "image" || segment.segment_type === "user_image") {
        // if (!didUpdateAssetEnable) {
        //   await enableAssetValidation().then(isAssetEnabled => setDidUpdateAssetEnable(isAssetEnabled))
        // }
        node = {
          "nodeType": "embedded-asset-block",
          "content": [],
          "data": {
            "target": {
              "sys": {
                "id": segment.id,
                "type": "Link",
                "linkType": "Asset"
              }
            }
          }
        }
      } else if (segment.segment_type === "code" || segment.segment_type === "user_code") {
        node = {
          "nodeType": "paragraph",
          data: {},
          "content": [
            {
              "nodeType": "text",
              "value": segment.text,
              "marks": [{ "type": "code" }],
              "data": {}
            }
          ]
        }
      }
      else {
        continue
      }
      resultContent.push(node)
    }
    resultDocument.content = resultContent
    console.log("resultDocument: ", resultDocument);
    sdk.field.setValue(resultDocument)
    setMediaName(blog.segments[0]?.title)
  }

  useEffect(() => {
    sdk.field.onSchemaErrorsChanged((errors) => {
      let messagesToRender = []
      console.log("sdk in field", sdk);
      const settingsUrl = `https://app.contentful.com/spaces/${sdk.ids.space}/content_types/${sdk.ids.contentType}/fields`
      const settingsUrlComponent = (
        <TextLink
          href={settingsUrl}
          target="_blank"
          rel="noopener noreferrer"
        >here</TextLink>
      )
      for (const error of errors) {
        if (error.name === "enabledNodeTypes" && !error.message.includes("block asset")) {
          sdk.notifier.error('Check field settings and enable "Embedded Assets"');
          messagesToRender.push(
            <Note variant="negative">
              Check field settings and enable "Embedded Assets" {settingsUrlComponent} -
              <Text fontWeight="fontWeightDemiBold"> refresh the page to see applied changes!</Text>
            </Note>
          )
        } else if (error.name === "size") {
          sdk.notifier.warning("Remove images or increase the Embedded Assets limit in the field settings");
          messagesToRender.push(
            <Note variant="warning">
              Remove images or increase the Embedded Assets limit in the field settings {settingsUrlComponent} -
              <Text fontWeight="fontWeightDemiBold"> refresh the page to see applied changes!</Text>
            </Note>
          )
        }
      }
      setAdviceErrorNotes(messagesToRender)
    })
  }, [sdk.field])

  return (
    <>
      <Form onSubmit={() => openDialog()}>
        <FormControl>
          <Button type='submit' variant='primary'>Choose a Contenda Blog</Button>
        </FormControl>
      </Form>
      {mediaName !== undefined ?
        <>
          <Text fontSize="fontSizeL">Video title: </Text>
          <Text fontSize="fontSizeL" as="i" fontWeight="fontWeightMedium">{mediaName}</Text>
        </> : undefined
      }
      {/* {didUpdateAssetEnable ? <Note variant="neutral">Changed field's validation rule to enable "Embedded Assets" to include blog images</Note> : undefined} */}
      <RichTextEditor sdk={sdk} isInitiallyDisabled={true} />
      {adviceErrorNotes}
    </>
  )
};

export default Field;
