import React, { useState } from 'react';
import { RichTextEditor } from '@contentful/field-editor-rich-text';
import { Form, FormControl, Button, Text } from '@contentful/f36-components';
import { useCMA, useSDK, useAutoResizer } from '@contentful/react-apps-toolkit';


const Field = () => {
  const sdk = useSDK();
  useAutoResizer()

  const handleButtonClick = async () => {
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
    console.log(sdk.field);
  }


  return (
    <>
      <Form onSubmit={handleButtonClick}>
        <FormControl>
          <Button type='submit' variant='primary'>Choose a Contenda Blog</Button>
        </FormControl>
      </Form>
      <RichTextEditor sdk={sdk} isInitiallyDisabled={true} />
    </>
  )
};

export default Field;
