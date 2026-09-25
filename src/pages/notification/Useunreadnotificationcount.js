import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Api } from "../../common/api/Api"; // adjust path for this file
import { setUnreadCount } from "../../redux/reducers/ChildReducer/NotificationReducer"; // adjust path

const UNREAD_POLL_MS = 60000;

// inside the component, next to where `unread` is read:
const dispatch = useDispatch();
const unread = useSelector((s) => s.NotificationReducer.unread_count);

useEffect(() => {
  let cancelled = false;

  const loadUnreadCount = async () => {
    try {
      const res = await Api.get("/notification/list/", {
        params: { page: 1, page_size: 1, unread_only: "true" },
      });
      if (!cancelled) dispatch(setUnreadCount(res?.data?.count ?? 0));
    } catch (e) {
      // keep the previous count on failure; badge is non-critical
    }
  };

  loadUnreadCount(); // on app load, without visiting /notifications

  const timer = setInterval(loadUnreadCount, UNREAD_POLL_MS);
  const onVisible = () => {
    if (document.visibilityState === "visible") loadUnreadCount();
  };
  document.addEventListener("visibilitychange", onVisible);

  return () => {
    cancelled = true;
    clearInterval(timer);
    document.removeEventListener("visibilitychange", onVisible);
  };
}, [dispatch]);
