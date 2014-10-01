/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements. See the NOTICE file distributed with this
 * work for additional information regarding copyright ownership. The ASF
 * licenses this file to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
package tds.itemrenderer.webcontrols;

/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements. See the NOTICE file distributed with this
 * work for additional information regarding copyright ownership. The ASF
 * licenses this file to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
import java.io.IOException;
import java.io.Serializable;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.el.ValueExpression;
import javax.faces.FacesException;
import javax.faces.application.FacesMessage;
import javax.faces.component.ContextCallback;
import javax.faces.component.EditableValueHolder;
import javax.faces.component.NamingContainer;
import javax.faces.component.UIComponent;
import javax.faces.component.UIComponentBase;
import javax.faces.component.UINamingContainer;
import javax.faces.component.visit.VisitCallback;
import javax.faces.component.visit.VisitContext;
import javax.faces.component.visit.VisitHint;
import javax.faces.component.visit.VisitResult;
import javax.faces.context.FacesContext;
import javax.faces.context.ResponseWriter;
import javax.faces.event.AbortProcessingException;
import javax.faces.event.FacesEvent;
import javax.faces.event.FacesListener;
import javax.faces.event.PhaseId;
import javax.faces.model.ArrayDataModel;
import javax.faces.model.DataModel;
import javax.faces.model.ListDataModel;
import javax.faces.model.ResultSetDataModel;
import javax.faces.model.ScalarDataModel;
import javax.faces.render.Renderer;

import org.apache.commons.lang3.StringUtils;
import org.apache.myfaces.view.facelets.component.RepeatStatus;

import tds.itemrenderer.webcontrols.CustomUiRepeat;

import AIR.Common.Web.taglib.IRebindableComponent;

/**
 * Shiva: Really need to design this class better! Right now I am breaking
 * encapsulation all over the place.
 */
public class CustomDataTable extends CustomUiRepeat
{
  public static final String COMPONENT_TYPE   = "facelets.ui.Repeat";

  public static final String COMPONENT_FAMILY = "facelets";

  public CustomDataTable () {
    setRendererType ("facelets.ui.Repeat");
  }

  public String getFamily () {
    return COMPONENT_FAMILY;
  }

  public void setRepeatDirection (String value) {
    getStateHelper ().put (LayoutRules.RepeatDirection, value);
  }

  public String getRepeatDirection () {
    return (String) getStateHelper ().get (LayoutRules.RepeatDirection);
  }

  public void setRepeatColumns (int value) {
    getStateHelper ().put (LayoutRules.RepeatColumns, value);
  }

  public int getRepeatColumns () {
    return (Integer) getStateHelper ().eval (LayoutRules.RepeatColumns, 1);
  }

  @Override
  public void process (FacesContext faces, PhaseId phase) {
   /* if (PhaseId.RENDER_RESPONSE.equals (phase))
      System.err.println ();*/
    // stop if not rendered
    if (!isRendered ()) {
      return;
    }

    // validate attributes
    _validateAttributes ();

    // reset index
    _captureScopeValues ();
    _setIndex (-1);

    try {
      // has children
      if (getChildCount () > 0) {
        int[][] layoutMatrix = buildLayout ();

        // grab renderer
        String rendererType = getRendererType ();
        Renderer renderer = null;
        if (rendererType != null) {
          renderer = getRenderer (faces);
        }

        _count = 0;
        ResponseWriter writer = faces.getResponseWriter ();
        if (PhaseId.RENDER_RESPONSE.equals (phase)) {
          writer.write ("<table ");
          
          for (String key : this.getAttributes ().keySet ())
          {
            writer.write (key + "=\"" + this.getAttributes ().get (key) + "\" ");
          }
          writer.write (" />");
        }

        for (int row = 0; row < layoutMatrix.length; ++row) {
          if (PhaseId.RENDER_RESPONSE.equals (phase))
            writer.write ("<tr>");
          for (int col = 0; col < getRepeatColumns (); ++col) {
            if (PhaseId.RENDER_RESPONSE.equals (phase))
              writer.write ("<td>");
            int i = layoutMatrix[row][col];
            _setIndex (i);
            if (_isIndexAvailable ()) {
              if (PhaseId.RENDER_RESPONSE.equals (phase) && renderer != null) {
                customRenderer (faces, this);
              } else {
                for (int j = 0, childCount = getChildCount (); j < childCount; j++) {
                  UIComponent child = getChildren ().get (j);
                  if (PhaseId.APPLY_REQUEST_VALUES.equals (phase)) {
                    child.processDecodes (faces);
                  } else if (PhaseId.PROCESS_VALIDATIONS.equals (phase)) {
                    child.processValidators (faces);
                  } else if (PhaseId.UPDATE_MODEL_VALUES.equals (phase)) {
                    child.processUpdates (faces);
                  } else if (PhaseId.RENDER_RESPONSE.equals (phase)) {
                    child.encodeAll (faces);
                  }
                }
              }
            }
            if (PhaseId.RENDER_RESPONSE.equals (phase))
              writer.write ("</td>");
          }

          if (PhaseId.RENDER_RESPONSE.equals (phase))
            writer.write ("</tr>");
        }

        if (PhaseId.RENDER_RESPONSE.equals (phase)) {
          writer.write ("</table>");
        }
      }
    } catch (IOException e) {
      throw new FacesException (e);
    } finally {
      _setIndex (-1);
      _restoreScopeValues ();
    }
  }

  private int[][] buildLayout () {
    // Shiva: I cannot think through this right now.
    // Document this somewhere.
    String layoutDirection = getRepeatDirection ();
    if (StringUtils.isEmpty (layoutDirection))
      layoutDirection = "horizontal";

    // TODO Shiva: offset, end and step are currently not being used.
    int offset = getOffset ();
    int end = getSize ();
    int step = getStep ();

    int repeatColumns = getRepeatColumns ();
    int rowCount = getDataModel ().getRowCount ();

    int rowsRequired = (int) Math.ceil (((double) rowCount) / repeatColumns);

    int[][] layoutMatrix = new int[rowsRequired][repeatColumns];

    int excessColumns = repeatColumns - (rowsRequired * repeatColumns - rowCount);

    if (StringUtils.equalsIgnoreCase (layoutDirection, "horizontal")) {
      for (int row = 0; row < rowsRequired; ++row)
        for (int col = 0; col < repeatColumns; ++col)
          layoutMatrix[row][col] = row * repeatColumns + col;
    } else if (StringUtils.equalsIgnoreCase (layoutDirection, "vertical")) {
      int counter1 = 0;
      for (int col = 0; col < repeatColumns; ++col)
        for (int row = 0; row < rowsRequired; ++row) {
          if (row != rowsRequired - 1 || col < excessColumns) {
            layoutMatrix[row][col] = counter1;
            ++counter1;
          } else {
            layoutMatrix[row][col] = rowCount + 1;
          }
        }
    } else
      throw new RuntimeException ("repeatDirection has wrong value. Accepted values are horizontal or vertical - case insensitive.");

    return layoutMatrix;
  }

  enum LayoutRules {
    RepeatDirection, RepeatColumns
  }
}
