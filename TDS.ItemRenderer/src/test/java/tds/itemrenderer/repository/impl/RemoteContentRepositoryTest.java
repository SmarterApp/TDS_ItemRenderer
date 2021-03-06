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

package tds.itemrenderer.repository.impl;

import org.apache.commons.io.IOUtils;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;

import tds.blackbox.ContentRequestException;
import tds.itemrenderer.data.AccLookup;
import tds.itemrenderer.data.IITSDocument;
import tds.itemrenderer.data.ITSDocument;
import tds.itemrenderer.data.xml.wordlist.Itemrelease;

import static org.junit.Assert.assertEquals;
import static org.mockito.Matchers.isA;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class RemoteContentRepositoryTest {
    private RemoteContentRepository remoteContentRepository;

    @Mock
    private RestTemplate mockRestTemplate;

    @Before
    public void setUp() {
        remoteContentRepository = new RemoteContentRepository(mockRestTemplate, "http://localhost:8080");
    }

    @Test
    public void shouldFindItemDocument() {
        final String itemPath = "/path/to/item";
        final AccLookup accLookup = new AccLookup();
        final IITSDocument itsDocument = new ITSDocument();
        itsDocument.setVersion(2000);

        ResponseEntity<IITSDocument> responseEntity = new ResponseEntity<>(itsDocument, HttpStatus.OK);
        when(mockRestTemplate.exchange(isA(URI.class), isA(HttpMethod.class), isA(HttpEntity.class), isA(ParameterizedTypeReference.class)))
            .thenReturn(responseEntity);
        final IITSDocument retItsDocument = remoteContentRepository.findItemDocument(itemPath, accLookup, "", false);
        assertEquals((int)retItsDocument.getVersion(), 2000);
        verify(mockRestTemplate).exchange(isA(URI.class), isA(HttpMethod.class), isA(HttpEntity.class), isA(ParameterizedTypeReference.class));
    }

    @Test
    public void shouldFindWordList() {
        final String wordListEndpoint = "{contentUrl}/wordlist?itemPath={itemPath}";
        final String contentUrl = "contentUrl";
        final String itemPath = "path";

        final String itemVersion = "200";
        final Itemrelease expectedWordList = new Itemrelease();
        expectedWordList.setVersion(itemVersion);

        when(mockRestTemplate.getForObject(isA(String.class), isA(Class.class), isA(String.class), isA(String.class), isA(String.class), isA(Boolean.class)))
            .thenReturn(expectedWordList);
        final Itemrelease actualWordList = remoteContentRepository.findWordListItem(itemPath, "", false);
        assertEquals(actualWordList.getVersion(), itemVersion);
        verify(mockRestTemplate).getForObject(isA(String.class), isA(Class.class), isA(String.class), isA(String.class), isA(String.class), isA(Boolean.class));
    }

    @Test(expected = ContentRequestException.class)
    public void shouldThrowForContentRequestException() {
        final String itemPath = "/path/to/item";
        final AccLookup accLookup = new AccLookup();
        final IITSDocument itsDocument = new ITSDocument();
        itsDocument.setVersion(2000);

        when(mockRestTemplate.exchange(isA(URI.class), isA(HttpMethod.class), isA(HttpEntity.class), isA(ParameterizedTypeReference.class)))
            .thenThrow(new RestClientException("Exception"));
        remoteContentRepository.findItemDocument(itemPath, accLookup, "", false);
    }

    @Test
    public void shouldFindResource() throws IOException {
        final String resourcePath = "/path/to/resource";
        final String data = "myData";
        final Resource resource = new ByteArrayResource(data.getBytes());

        ResponseEntity<Resource> responseEntity = new ResponseEntity<>(resource, HttpStatus.OK);
        when(mockRestTemplate.exchange(isA(URI.class), isA(HttpMethod.class), isA(HttpEntity.class), isA(ParameterizedTypeReference.class)))
            .thenReturn(responseEntity);
        final InputStream retData = remoteContentRepository.findResource(resourcePath);
        assertEquals(IOUtils.toString(retData), data);
        verify(mockRestTemplate).exchange(isA(URI.class), isA(HttpMethod.class), isA(HttpEntity.class), isA(ParameterizedTypeReference.class));
    }

    @Test(expected = IOException.class)
    public void shouldThrowIOExceptionFor404() throws IOException {
        final String resourcePath = "/path/to/resource";

        when(mockRestTemplate.exchange(isA(URI.class), isA(HttpMethod.class), isA(HttpEntity.class), isA(ParameterizedTypeReference.class)))
            .thenThrow(new HttpClientErrorException(HttpStatus.NOT_FOUND));
        remoteContentRepository.findResource(resourcePath);
    }
}
