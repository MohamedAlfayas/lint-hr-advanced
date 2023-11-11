import Swal from "sweetalert2"
import '../../../common/./css/lc_style.css';

export const SweetAlert = (show, content, btnText, btnClass, input = false, inputValue,  customClass) => {
  if (show) {
    Swal.fire({
      icon: "info",
      html: content,
      input: input ? 'text' : undefined,
      inputPlaceholder: 'Enter Reason',
      showCloseButton: false,
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: btnText,
      cancelButtonText: 'Cancel',
      inputValue: inputValue,
      customClass: {
        input: 'custom-input-class',
        container: 'custom-modal-container',
        content: customClass, 
       
      },
      preConfirm: (value) => {
        if (input) {
          if (!value.trim()) {
            Swal.showValidationMessage('Please enter a reason');
          }
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("Send API");
      }

    });
  }
}