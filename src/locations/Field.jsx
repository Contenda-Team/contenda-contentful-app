import React, { useState } from 'react';
import { RichTextEditor } from '@contentful/field-editor-rich-text';
import { Form, FormControl, Button, Text } from '@contentful/f36-components';
import { useCMA, useSDK, useAutoResizer } from '@contentful/react-apps-toolkit';


const Field = () => {
  const sdk = useSDK();

  const [mediaName, setMediaName] = useState()

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
      // const resultDocument = {
      //   "nodeType": "document",
      //   "data": {},
      //   "content": [
      //     {
      //       "nodeType": "paragraph",
      //       "data": {},
      //       "content": [
      //         {
      //           "nodeType": "text",
      //           "value": "hello",
      //           "marks": [],
      //           "data": {}
      //         }
      //       ]
      //     },
      //     {
      //       "nodeType": "embedded-entry-asset",
      //       "content": [],
      //       "data": {
      //         "target": {
      //           "sys": {
      //             "id": "c0c873fe-599f-482d-ba96-bdf336683e3c",
      //             "type": "Link",
      //             "linkType": "Asset"
      //           }
      //         }
      //       }
      //     }
      //   ]
      // }
      // sdk.field.setValue(resultDocument)
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
        continue // remove later when supporting images
        console.log("image ", segment);
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
      {/* {documentToReactComponents(sdk.field.getValue(), renderOptions)} */}
      <RichTextEditor sdk={sdk} isInitiallyDisabled={true} />
    </>
  )
};

export default Field;
