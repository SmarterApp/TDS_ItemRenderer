/*******************************************************************************
 * Educational Online Test Delivery System Copyright (c) 2014 American
 * Institutes for Research
 *
 * Distributed under the AIR Open Source License, Version 1.0 See accompanying
 * file AIR-License-1_0.txt or at http://www.smarterapp.org/documents/
 * American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.data;

// Represents the raw ITS XML data.

public class ITSDocumentXml extends ITSDocument {
    private long itemKey;
    private String layout;

    @Override
    public String getFormat() {
        return format;
    }

    public void setItemKey(Long value) {
        itemKey = value;
    }

    @Override
    public long getItemKey() {
        return itemKey;
    }

    @Override
    public void setLayout(String value) {
        layout = value;
    }

    @Override
    public String getLayout() {
        return layout;
    }

    @Override
    public String getResponseType() {
        return null;
    }

    @Override
    public String getSubject() {
        return null;
    }

    @Override
    public String getGrade() {
        return null;
    }

    @Override
    public String getAnswerKey() {
        return null;
    }

    @Override
    public String getCredit() {
        return null;
    }

    @Override
    public String getCopyright() {
        return null;
    }
}
