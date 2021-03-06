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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.io.InputStream;

import tds.blackbox.ContentRequestException;
import tds.itemrenderer.data.AccLookup;
import tds.itemrenderer.data.IITSDocument;
import tds.itemrenderer.data.ITSDocument;
import tds.itemrenderer.data.xml.wordlist.Itemrelease;
import tds.itemrenderer.repository.ContentRepository;

@Repository
@Primary
public class RemoteContentRepository implements ContentRepository {
    private final RestTemplate restTemplate;
    private final String contentUrl;

    @Autowired
    public RemoteContentRepository(@Qualifier("integrationRestTemplate") final RestTemplate restTemplate,
                                   @Value("${tds.content.remote.url}") final String contentUrl) {
        this.restTemplate = restTemplate;
        this.contentUrl = contentUrl;
    }

    @Override
    public ITSDocument findItemDocument(final String itemPath, final AccLookup accommodations, final String contextPath, final boolean oggAudioSupport) throws ContentRequestException {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Accept", MediaType.APPLICATION_JSON_VALUE);
        HttpEntity<?> requestHttpEntity = new HttpEntity<>(accommodations, headers);
        ResponseEntity<ITSDocument> responseEntity;

        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(String.format("%s/item", contentUrl))
            .queryParam("itemPath", itemPath)
            .queryParam("contextPath", contextPath)
            .queryParam("oggAudioSupport", oggAudioSupport);

        try {
            responseEntity = restTemplate.exchange(
                builder.build().toUri(),
                HttpMethod.POST,
                requestHttpEntity,
                new ParameterizedTypeReference<ITSDocument>() {
                });
        } catch (RestClientException rce) {
            throw new ContentRequestException(rce);
        }

        return responseEntity.getBody();
    }

    @Override
    public InputStream findResource(String resourcePath) throws IOException {
        HttpEntity<?> requestHttpEntity = new HttpEntity<>(new HttpHeaders());
        ResponseEntity<Resource> responseEntity;

        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(String.format("%s/resource", contentUrl))
            .queryParam("resourcePath", resourcePath);

        try {
            responseEntity = restTemplate.exchange(
                builder.build().toUri(),
                HttpMethod.GET,
                requestHttpEntity,
                new ParameterizedTypeReference<Resource>() {
                });

            return responseEntity.getBody().getInputStream();
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().equals(HttpStatus.NOT_FOUND) || e.getStatusCode().equals(HttpStatus.FORBIDDEN)) {
                throw new IOException(e);
            }

            throw e;
        }
    }

    @Override
    public Itemrelease findWordListItem(final String itemPath, final String contextPath, final boolean oggAudioSupport) throws ContentRequestException {
        try {
            return restTemplate.getForObject("{contentUrl}/wordlist?itemPath={itemPath}&contextPath={contextPath}&oggAudioSupport={oggAudioSupport}",
                Itemrelease.class, contentUrl, itemPath, contextPath, oggAudioSupport);
        } catch (RestClientException rce) {
            throw new ContentRequestException(rce);
        }
    }
}
