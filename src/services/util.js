import moment from 'moment'
import { ToastProgrammatic as Toast } from 'buefy'

//*format date. this function take Date() as instance
export const formatDate = function(date, format) {
  if (!format) {
    format = 'YYYY-MM-DD'
  }

  return moment
    .utc(date)
    .local()
    .format(format)
}

//* this is a function to show toast
//* type can be is-success or is-danger
//* position can be is-top or is-bottom
export const showToast = function(message, type, position) {
  Toast.open({
    message: message,
    type: type,
    duration: 5000,
    position: position != null ? position : 'is-top',
  })
}