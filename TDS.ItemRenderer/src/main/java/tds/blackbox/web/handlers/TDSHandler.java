/*******************************************************************************
 * Educational Online Test Delivery System Copyright (c) 2014 American
 * Institutes for Research
 * 
 * Distributed under the AIR Open Source License, Version 1.0 See accompanying
 * file AIR-License-1_0.txt or at http://www.smarterapp.org/documents/
 * American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.blackbox.web.handlers;

import AIR.Common.Web.HttpHandlerBase;
import AIR.Common.Web.TDSReplyCode;
import AIR.Common.data.ResponseData;
import TDS.Shared.Configuration.TDSSettings;
import TDS.Shared.Exceptions.TDSHttpException;
import TDS.Shared.Exceptions.TDSSecurityException;
import TDS.Shared.Security.TDSIdentity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import javax.servlet.http.HttpServletResponse;

public class TDSHandler extends HttpHandlerBase
{
  @Autowired
  protected TDSSettings _tdsSettings;

  public String getClientName ()
  {
    return _tdsSettings.getClientName ();
  }

  private static Logger _logger = LoggerFactory.getLogger (TDSHandler.class);

  // #region Exception Handling
  @ExceptionHandler ({ TDSSecurityException.class })
  @ResponseBody
  public ResponseData<String> handleSecurityException (TDSSecurityException httpSecEx, HttpServletResponse response) {
    _logger.error (httpSecEx.getMessage (), httpSecEx);
    response.setStatus (httpSecEx.getHttpStatusCode ());
    return new ResponseData<String> (TDSReplyCode.Denied.getCode (), httpSecEx.getMessage (), "");
  }

  // / <summary>
  // / Intentional exception thrown with HTTP error codes provided
  // / </summary>
  // / <remarks>
  // / This exception can be thrown from an API method if someone wants to
  // specify
  // / a http status/description and throw an exception at the same time.
  // / </remarks>
  @ExceptionHandler ({ TDSHttpException.class })
  @ResponseBody
  public ResponseData<String> handleHttpException (TDSHttpException httpEx, HttpServletResponse response) {
    _logger.error (httpEx.getMessage (), httpEx);
    response.setStatus (httpEx.getHttpStatusCode ());
    return new ResponseData<String> (TDSReplyCode.Error.getCode (), httpEx.getMessage (), "");
  }

  @ResponseStatus (value = org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
  @ExceptionHandler (Exception.class)
  public @ResponseBody
  ResponseData<Object> handleAllOtherException (Exception e) {
    _logger.error (e.getMessage (), e);
    return new ResponseData<Object> (TDSReplyCode.Error.getCode (), "A problem was encountered while processing the request. You will be logged out.", null);
  }

  // / <summary>
  // / Explicit error condition returned from SP
  // / </summary>
  // / <remarks>
  // / 403: The server understood the request, but is refusing to fulfill it.
  // Authorization will not help and the request SHOULD NOT be repeated.
  // / </remarks>
  /*
   * @ExceptionHandler ({ ReturnStatusException.class })
   * 
   * @ResponseBody public ResponseData<String> handleReturnStatusException
   * (ReturnStatusException rse, HttpServletResponse response) {
   * response.setStatus (HttpStatusCode.Forbidden); // 403 return new
   * ResponseData<String> (TDSReplyCode.ReturnStatus.getCode (),
   * rse.getReturnStatus ().getReason (), ""); }
   */

  // #endregion

  protected TDSHandler() {
    /*
     * WebHelper.PreventClientCache();
     * 
     * // register global handler which takes an error and logs it but allows
     * other registed handlers to execute RegisterExceptionHandler((Exception
     * exception) => TDSLogger.Application.Error(exception), true);
     * 
     * // register exception handlers
     * RegisterExceptionHandler<TDSSecurityException>(HandleSecurityException);
     * RegisterExceptionHandler<TDSHttpException>(HandleHttpException);
     * RegisterExceptionHandler
     * <ReturnStatusException>(HandleReturnStatusException);
     * RegisterExceptionHandler<Exception>(HandleException);
     * 
     * // DEBUG: send all error messages in http status description
     * SendErrorMessage = true;
     */
  }

  protected void checkAuthenticated () throws TDSSecurityException {
    if (!isAuthenticated ()) {
      throw new TDSSecurityException ();
    }
  }

  protected boolean isAuthenticated () {
    return TDSIdentity.getCurrentTDSIdentity ().isAuthenticated ();
  }

  /*
   * (non-Javadoc)
   * 
   * @see AIR.Common.Web.HttpHandlerBase#onBeanFactoryInitialized()
   */
  @Override
  protected void onBeanFactoryInitialized () {

  }

  protected String getTime () {
    java.text.SimpleDateFormat df = new java.text.SimpleDateFormat ("MM-dd-yyyy hh:mm:ss");
    return df.format (new java.util.Date ());
  }

}
