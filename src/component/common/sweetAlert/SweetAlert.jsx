import Swal from "sweetalert2"

export const SweetAlert = (show, content, btnText, btnClass,) =>{
    if(show){
        Swal.fire({
            icon: "info",
            html: content,
            showCloseButton: false,
            showCancelButton: true,
            focusConfirm: false,
            confirmButtonText: btnText,
            cancelButtonText: 'Cancel',
          }).then((result) => {
            if(result.isConfirmed){
                console.log("Send API");
            }
          });
    }
}