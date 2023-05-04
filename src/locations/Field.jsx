import React, { useState, useEffect } from 'react';
import { RichTextEditor } from '@contentful/field-editor-rich-text';
import { Form, FormControl, Button, Text, Note } from '@contentful/f36-components';
import {  useSDK, useAutoResizer } from '@contentful/react-apps-toolkit';


const Field = () => {
  const sdk = useSDK();

  const [mediaName, setMediaName] = useState()
  const [adviceErrorMessages, setAdviceErrorMessages] = useState([])  // custom notes when specific validation errors are present

  useAutoResizer()

  const openDialog = async () => {
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
      for (const error of errors) {
        if (error.name === "enabledNodeTypes" && !error.message.includes("block asset")) {
          messagesToRender.push(<Note variant="neutral">Check the field's settings to enable "Embedded Assets"</Note>)
        } else if (error.name === "size") {
          messagesToRender.push(<Note variant="neutral">Check the field's settings to increase the limit number of Embedded Assets</Note>)
        }
      }
      setAdviceErrorMessages(messagesToRender)
    })
  }, [sdk.field.validation])

  return (
    <>
      <Form onSubmit={() => {
        openDialog()
      }}>
        <FormControl>
          <Button type='submit' variant='primary'>Choose a Contenda Blog</Button>
        </FormControl>
      </Form>
      {mediaName !== undefined ? <Text>Media title: {mediaName}</Text> : undefined}
      <RichTextEditor sdk={sdk} isInitiallyDisabled={true} />
      {adviceErrorMessages}
    </>
  )
};

export default Field;
