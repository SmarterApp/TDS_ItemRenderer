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

package tds.itemrenderer.processing;

import java.io.IOException;

/**
 * Implementations of this interface are responsible for reading
 * retrieving a RendererSpec by path.
 */
public interface RendererSpecService {

    /**
     * Find the Renderer Spec specified by the given path.
     *
     * @param rendererSpecPath The path to the renderer spec
     * @return  The renderer spec contents
     * @throws IOException if there is a problem reading the renderer spec
     */
    String findOne(final String rendererSpecPath) throws IOException;
}
