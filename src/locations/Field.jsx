import React, { useState, useEffect } from 'react';
import { RichTextEditor } from '@contentful/field-editor-rich-text';
import { Form, FormControl, Button, Note } from '@contentful/f36-components';
import { useCMA, useSDK, useAutoResizer } from '@contentful/react-apps-toolkit';
import { ValidationError } from '@contentful/app-sdk';


const Field = () => {
  const sdk = useSDK();
  const cma = useCMA()
  const [adviceErrorMessages, setAdviceErrorMessages] = useState([])

  console.log("sdk.contentType:", sdk.contentType);
  console.log("sdk.field:", sdk.field);
  console.log("sdk.value", sdk.contentType)

  useAutoResizer()

  const handleButtonClick = async () => {
    console.log("handleButtonClick");

    // openDialog()
    const contentTypeId = sdk.contentType.sys.id
    let contentTypeData = await cma.contentType.get({ "contentTypeId": contentTypeId })
    let fieldData = contentTypeData.fields.find(field => field.id == sdk.field.id)
    let enabledTypesValidationRule = fieldData.validations.find(validation => "enabledNodeTypes" in validation)

    if (enabledTypesValidationRule && !enabledTypesValidationRule.enabledNodeTypes.includes("embedded-asset-block")) {
      console.log("need to edit validation");
      enabledTypesValidationRule.enabledNodeTypes.push("embedded-asset-block")
      enabledTypesValidationRule.message = "Only heading 1, heading 2, heading 3, heading 4, heading 5, heading 6, ordered list, unordered list, horizontal rule, quote, block entry, table, link to Url, link to entry, inline entry, and asset nodes are allowed"
      cma.contentType.update({ contentTypeId: contentTypeId }, contentTypeData)
        .then(updatedContentType => cma.contentType.publish({ contentTypeId: contentTypeId }, updatedContentType))
    }

    const resultDocument = {
      "nodeType": "document",
      "data": {},
      "content": [
        {
          "nodeType": "paragraph",
          "data": {},
          "content": [
            {
              "nodeType": "text",
              "value": "hi i promise i'm using the embedded-asset-block!",
              "marks": [],
              "data": {}
            }
          ]
        },
        {
          "nodeType": "embedded-asset-block",
          "content": [],
          "data": {
            "target": {
              "sys": {
                "id": "61iT3zdYzUW73hoIoAQcsp",
                "type": "Link",
                "linkType": "Asset"
              }
            }
          }
        }
      ]
    }
    sdk.field.setValue(resultDocument)
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
  }, [sdk.field.validations])


  return (
    <>
      <Form onSubmit={handleButtonClick}>
        <FormControl>
          <Button type='submit' variant='primary'>Choose a Contenda Blog</Button>
        </FormControl>
      </Form>
      <RichTextEditor sdk={sdk} isInitiallyDisabled={true} />
      {adviceErrorMessages}
    </>
  )
};

export default Field;
