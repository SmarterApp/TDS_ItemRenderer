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

package tds.itemrenderer.web;

import TDS.Shared.Exceptions.TDSHttpException;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.context.support.SpringBeanAutowiringSupport;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

import tds.itemrenderer.repository.ContentRepository;

public class RemoteResourceHandler extends ResourceHandler {

    @Autowired
    private ContentRepository contentRepository;

    @Override
    public void init() throws ServletException {
        // This needs to be called to inject our ContentRepository, as this class is instantiated by the servlet, not spring
        SpringBeanAutowiringSupport.processInjectionBasedOnCurrentContext (this);
    }

    @Override
    public void staticFileHandler(final HttpServletRequest request, final HttpServletResponse response) throws TDSHttpException, IOException
    {
        String physicalPath = overrideExecuteUrlPath(request);
        byte[] bytes = IOUtils.toByteArray(contentRepository.findResource(physicalPath));

        // In order to display SVG files in an <img> tag, the browser needs to know the content type, where this isn't needed for other types
        if (physicalPath != null && physicalPath.toLowerCase().endsWith(".svg")) {
            response.setHeader("Content-Type", "image/svg+xml");
        }

        response.getOutputStream().write(bytes);
    }
}
