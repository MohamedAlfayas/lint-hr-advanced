import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Api } from "../../common/api/Api";
import { setUnreadCount } from "../../redux/reducers/ChildReducer/NotificationReducer";

const POLL_MS = 30000;
const RETRY_MS = 3000;
const MAX_RETRIES = 5;

const useUnreadCountSync = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    let cancelled = false;
    let retryTimer = null;

    const load = async (attempt = 0) => {
      try {
        const res = await Api.get("/notification/list/", {
          params: { page: 1, page_size: 1, unread_only: "true" },
        });
        if (!cancelled) dispatch(setUnreadCount(res?.data?.count ?? 0));
      } catch (err) {
        console.warn(
          "Unread count fetch failed:",
          err?.response?.status,
          err?.message,
        );
        // On refresh the token may not be ready yet, so retry a few times
        if (!cancelled && attempt < MAX_RETRIES) {
          retryTimer = setTimeout(() => load(attempt + 1), RETRY_MS);
        }
      }
    };

    load();

    const pollTimer = setInterval(() => load(), POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
      clearInterval(pollTimer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [dispatch]);
};

export default useUnreadCountSync;
