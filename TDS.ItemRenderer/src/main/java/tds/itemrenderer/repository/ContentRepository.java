/***************************************************************************************************
 * Educational Online Test Delivery System
 * Copyright (c) 2017 Regents of the University of California
 *
 * Distributed under the AIR Open Source License, Version 1.0
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 *
 * SmarterApp Open Source Assessment Software Project: http://smarterapp.org
 * Developed by Fairway Technologies, Inc. (http://fairwaytech.com)
 * for the Smarter Balanced Assessment Consortium (http://smarterbalanced.org)
 **************************************************************************************************/

package tds.itemrenderer.repository;

import java.io.IOException;
import java.io.InputStream;

import tds.blackbox.ContentRequestException;
import tds.itemrenderer.data.AccLookup;
import tds.itemrenderer.data.IITSDocument;
import tds.itemrenderer.data.xml.wordlist.Itemrelease;

/**
 * Repository to interact with content data
 */
public interface ContentRepository {
    /**
     * Fetches the {@link tds.itemrenderer.data.IITSDocument} item document
     *
     * @param itemPath        The path to the item
     * @param accommodations  The accommodations collection
     * @param contextPath     The context path of the web application that will serve the resources linked to by the its document
     * @param oggAudioSupport Does browser support exists for the ogg-vorbis audio format
     * @return The {@link tds.itemrenderer.data.IITSDocument} item xml
     * @throws ContentRequestException
     */
    IITSDocument findItemDocument(final String itemPath, final AccLookup accommodations, final String contextPath, final boolean oggAudioSupport) throws ContentRequestException;

    /**
     * Fetches the resource at the specified resource path
     *
     * @param resourcePath The path to the resource
     * @return The resource data input stream
     * @throws IOException
     */
    InputStream findResource(final String resourcePath) throws IOException;

    /**
     * Fetches the {@link tds.itemrenderer.data.xml.wordlist.Itemrelease} word list item
     *
     * @param itemPath        Path to the item
     * @param contextPath     Context path of the web application that will serve the resources linked to by the its document
     * @param oggAudioSupport Does browser support exists for the ogg-vorbis audio format
     * @return The {@link tds.itemrenderer.data.xml.wordlist.Itemrelease} item xml
     * @throws ContentRequestException
     */
    Itemrelease findWordListItem(final String itemPath, final String contextPath, final boolean oggAudioSupport) throws ContentRequestException;
}
