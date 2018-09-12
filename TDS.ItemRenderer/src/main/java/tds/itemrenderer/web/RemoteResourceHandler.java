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

import AIR.Common.Web.StaticFileHandler3;
import TDS.Shared.Exceptions.TDSHttpException;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.context.support.SpringBeanAutowiringSupport;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;

import tds.itemrenderer.repository.ContentRepository;

public class RemoteResourceHandler extends ResourceHandler {

    @Autowired
    private ContentRepository contentRepository;

    @Override
    public void init() throws ServletException {
        // This needs to be called to inject our ContentRepository, as this class is instantiated by the servlet, not spring
        SpringBeanAutowiringSupport.processInjectionBasedOnCurrentContext(this);
    }

    @Override
    public void staticFileHandler(final HttpServletRequest request, final HttpServletResponse response) throws TDSHttpException, IOException {
        String physicalPath = overrideExecuteUrlPath(request);

        if (physicalPath != null && physicalPath.toLowerCase().endsWith(".mp4")) {
            try {
                final File resourceFile = stream2file(contentRepository.findResource(physicalPath));
                StaticFileHandler3.ProcessRequestInternal(request, response, resourceFile.getPath());
                resourceFile.delete();
            } catch (Exception e) {
                throw new IOException(e);
            }
        } else {
            byte[] bytes = IOUtils.toByteArray(contentRepository.findResource(physicalPath));
            // In order to display SVG files in an <img> tag, the browser needs to know the content type, where this isn't needed for other types
            if (physicalPath != null && physicalPath.toLowerCase().endsWith(".svg")) {
                response.setHeader("Content-Type", "image/svg+xml");
            }

            response.getOutputStream().write(bytes);
        }

    }

    private static File stream2file(InputStream in) throws IOException {
        final File tempFile = File.createTempFile("temp-vid", ".mp4");
        // This file will be deleted when the application exits as a fall back - but we should still try and delete the file explicitly
        tempFile.deleteOnExit();
        try (FileOutputStream out = new FileOutputStream(tempFile)) {
            IOUtils.copy(in, out);
        }

        return tempFile;
    }

}