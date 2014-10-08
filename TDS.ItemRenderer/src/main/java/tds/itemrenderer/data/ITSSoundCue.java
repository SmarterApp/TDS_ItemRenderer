/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.data;

    public class ITSSoundCue // IITSResource
    {
        public long _id; // { get; set; }
        public long _bankKey; // { get; set; }
        
        public long getId () {
          return _id;
        }
        public void setId (long _id) {
          this._id = _id;
        }
        public long getBankKey () {
          return _bankKey;
        }
        public void setBankKey (long _bankKey) {
          this._bankKey = _bankKey;
        }
        
        
        
    }

