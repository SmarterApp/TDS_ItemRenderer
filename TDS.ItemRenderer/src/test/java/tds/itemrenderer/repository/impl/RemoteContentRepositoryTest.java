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

import TDS.Shared.Exceptions.ReturnStatusException;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.net.URI;

import tds.itemrenderer.data.AccLookup;
import tds.itemrenderer.data.ITSDocument;

import static org.mockito.Matchers.isA;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.junit.Assert.assertEquals;

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
    public void shouldFindItemDocument() throws ReturnStatusException {
        final String itemPath = "/path/to/item";
        final AccLookup accLookup = new AccLookup();
        final ITSDocument itsDocument = new ITSDocument();
        itsDocument.setVersion(2000);

        ResponseEntity<ITSDocument> responseEntity = new ResponseEntity<>(itsDocument, HttpStatus.OK);
        when(mockRestTemplate.exchange(isA(URI.class), isA(HttpMethod.class), isA(HttpEntity.class), isA(ParameterizedTypeReference.class)))
            .thenReturn(responseEntity);
        final ITSDocument retItsDocument = remoteContentRepository.findItemDocument(itemPath, accLookup);
        assertEquals((int)retItsDocument.getVersion(), 2000);
        verify(mockRestTemplate).exchange(isA(URI.class), isA(HttpMethod.class), isA(HttpEntity.class), isA(ParameterizedTypeReference.class));
    }

    @Test(expected = ReturnStatusException.class)
    public void shouldThrowForRestClientException() throws ReturnStatusException {
        final String itemPath = "/path/to/item";
        final AccLookup accLookup = new AccLookup();
        final ITSDocument itsDocument = new ITSDocument();
        itsDocument.setVersion(2000);

        when(mockRestTemplate.exchange(isA(URI.class), isA(HttpMethod.class), isA(HttpEntity.class), isA(ParameterizedTypeReference.class)))
            .thenThrow(new RestClientException("Exception"));
        remoteContentRepository.findItemDocument(itemPath, accLookup);
    }
}
