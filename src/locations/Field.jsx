import React, { useState, useEffect } from 'react';
import { RichTextEditor } from '@contentful/field-editor-rich-text';
import { Form, FormControl, Button, Text, Note } from '@contentful/f36-components';
import { useSDK, useAutoResizer, useCMA } from '@contentful/react-apps-toolkit';


const Field = () => {
  let sdk = useSDK();
  const cma = useCMA()

  const [mediaName, setMediaName] = useState()
  const [adviceErrorNotes, setAdviceErrorNotes] = useState([])  // custom notes when specific validation errors are present
  const [didUpdateAssetEnable, setDidUpdateAssetEnable] = useState(false) // validation that's updated automatically

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

  const enableAssetValidation = async () => {
    // console.log("enableAssetValidation");
    sdk.contentType.enabledNodeTypes("embedded-asset-block")
    const contentTypeId = sdk.contentType.sys.id
    let contentTypeData = await cma.contentType.get({ "contentTypeId": contentTypeId })
    let fieldData = contentTypeData.fields.find(field => field.id == sdk.field.id)
    let enabledTypesValidationRule = fieldData.validations.find(validation => "enabledNodeTypes" in validation)

    if (enabledTypesValidationRule && !enabledTypesValidationRule.enabledNodeTypes.includes("embedded-asset-block")) {
      // console.log("need to edit validation");
      
      enabledTypesValidationRule.enabledNodeTypes.push("embedded-asset-block")
      enabledTypesValidationRule.message = "Only heading 1, heading 2, heading 3, heading 4, heading 5, heading 6, ordered list, unordered list, horizontal rule, quote, block entry, table, link to Url, link to entry, inline entry, and asset nodes are allowed"
      cma.contentType.update({ contentTypeId: contentTypeId }, contentTypeData)
        .then(updatedContentType => cma.contentType.publish({ contentTypeId: contentTypeId }, updatedContentType))
        .then(publishedContentType => sdk.contentType = publishedContentType)

      return true
    }
    return false
  }

  useEffect(() => {
    sdk.field.onSchemaErrorsChanged((errors) => {
      let messagesToRender = []
      for (const error of errors) {
        if (error.name === "enabledNodeTypes" && !error.message.includes("block asset")) {
          messagesToRender.push(<Note variant="neutral">Check field settings and enable "Embedded Assets"</Note>)
        } else if (error.name === "size") {
          messagesToRender.push(<Note variant="neutral">Check field settings and increase the limit number of Embedded Assets</Note>)
        }
      }
      setAdviceErrorNotes(messagesToRender)
    })
  }, [sdk.field.validations])
  
  return (
    <>
      <Form onSubmit={() => openDialog()}>
        <FormControl>
          <Button type='submit' variant='primary'>Choose a Contenda Blog</Button>
        </FormControl>
      </Form>
      {mediaName !== undefined ? <Text>Media title: {mediaName}</Text> : undefined}
      {/* {didUpdateAssetEnable ? <Note variant="neutral">Changed field's validation rule to enable "Embedded Assets" to include blog images</Note> : undefined} */}
      <RichTextEditor sdk={sdk} isInitiallyDisabled={true} />
      {adviceErrorNotes}
    </>
  )
};

export default Field;
