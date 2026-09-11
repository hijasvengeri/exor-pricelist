"use client";

import { useEffect, useState, useCallback, useMemo, useRef, } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Table,
  Image,
  Input,
  message,
  Pagination,
  Flex,
  Typography,
} from "antd";
import styles from "./pricelist.module.css";
import { useRouter } from "next/navigation";
import { logCustomerActivity } from "../lib/customerActivity";

// ===============================================
// GLOBAL CONFIGURATION
// ===============================================

const PAGE_SIZE_HINT = 15;

const { Title } = Typography;

// ===============================================
// HELPER FUNCTIONS
// ===============================================

/**
 * Formats prices.
 */
const formatPrice = (price: any) => {
  const cleanPrice = String(price ?? "").replace(/[^\d.]/g, "");
  const numericPrice = parseFloat(cleanPrice);

  if (isNaN(numericPrice) || numericPrice <= 0) {
    return "-";
  }

  return `${numericPrice}`;
};

/**
 * Formats GST.
 */
const formatGST = (gst: any) => {
  if (gst === null || gst === undefined || gst === "") {
    return "-";
  }

  const value = String(gst).trim();

  if (value.includes("%")) {
    return value;
  }

  return `${value}%`;
};

/**
 * Groups and sorts data,
 * setting rowSpan for SL No and Item.
 */
const getGroupedData = (data: any[]) => {
  let count = 0;
  const groupedData: any[] = [];

  const sortedData = [...data].sort((a, b) => {
    // 1. PRIMARY SORT: sl_no
    const aSl = Number(a.sl_no) || 0;
    const bSl = Number(b.sl_no) || 0;

    if (aSl !== bSl) {
      return aSl - bSl;
    }

    // 2. SECONDARY SORT: sub_order
    const aOrder = Number(a.sub_order) || 0;
    const bOrder = Number(b.sub_order) || 0;

    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }

    // 3. FINAL FALLBACK
    const aItems = a.items || "";
    const bItems = b.items || "";

    return (
      aItems.localeCompare(bItems) ||
      (a.brand || "").localeCompare(b.brand || "")
    );
  });

  for (let i = 0; i < sortedData.length; i++) {
    const currentItem = sortedData[i];

    // Check if this item is the start
    // of a new SL No / Item group
    if (
      i === 0 ||
      currentItem.sl_no !== sortedData[i - 1].sl_no ||
      currentItem.items !== sortedData[i - 1].items
    ) {
      count = 1;

      for (let j = i + 1; j < sortedData.length; j++) {
        if (
          sortedData[j].sl_no === currentItem.sl_no &&
          sortedData[j].items === currentItem.items
        ) {
          count++;
        } else {
          break;
        }
      }

      groupedData.push({
        ...currentItem,
        rowSpan: count,
        isGroupStart: true,
      });
    } else {
      groupedData.push({
        ...currentItem,
        rowSpan: 0,
        isGroupStart: false,
      });
    }
  }

  return groupedData;
};

// ===============================================
// ANT DESIGN TABLE COLUMNS
// ===============================================

const columns = [
  {
    title: "SL No",
    dataIndex: "sl_no",
    key: "sl_no",
    align: "center" as const,

    onCell: (record: any) => ({
      rowSpan: record.rowSpan,
    }),

    width: 50,
    fixed: "left" as const,
  },

  {
    title: "Item",
    dataIndex: "items",
    key: "items",
    align: "center" as const,

    onCell: (record: any) => ({
      rowSpan: record.rowSpan,
    }),

    render: (text: any, record: any) =>
      record.rowSpan > 0 ? text : null,

    width: 120,
    fixed: "left" as const,
  },

  {
    title: "Brand",
    dataIndex: "brand",
    key: "brand",
    align: "center" as const,
    width: 80,
    fixed: "left" as const,

    render: (text: any) => text || "-",
  },

  {
    title: "Single",
    dataIndex: "single",
    key: "single",
    align: "center" as const,
    render: formatPrice,
    width: 70,
  },

  {
    title: "5+",
    dataIndex: "qty_5_plus",
    key: "qty_5_plus",
    align: "center" as const,
    render: formatPrice,
    width: 60,
  },

  {
    title: "10+",
    dataIndex: "qty_10_plus",
    key: "qty_10_plus",
    align: "center" as const,
    render: formatPrice,
    width: 60,
  },

  {
    title: "20+",
    dataIndex: "qty_20_plus",
    key: "qty_20_plus",
    align: "center" as const,
    render: formatPrice,
    width: 60,
  },

  {
    title: "50+",
    dataIndex: "qty_50_plus",
    key: "qty_50_plus",
    align: "center" as const,
    render: formatPrice,
    width: 60,
  },

  {
    title: "100+",
    dataIndex: "qty_100_plus",
    key: "qty_100_plus",
    align: "center" as const,
    render: formatPrice,
    width: 60,
  },

  {
    title: "GST",
    dataIndex: "gst",
    key: "gst",
    width: 70,
    align: "center" as const,
    render: formatGST,
  },

  {
    title: "MRP",
    dataIndex: "mrp",
    key: "mrp",
    align: "center" as const,
    render: formatPrice,
    width: 70,
  },

  {
    title: "Warranty",
    dataIndex: "warranty",
    key: "warranty",
    align: "center" as const,
    render: (w: any) => w || "-",
    width: 80,
  },

  {
    title: "Image",
    dataIndex: "product_image",
    key: "product_image",
    align: "center" as const,

    render: (imageUrl: string) =>
      imageUrl ? (
        <Image
          src={imageUrl}
          alt="Product"
          style={{
            maxWidth: "60px",
            maxHeight: "60px",
            objectFit: "cover",
          }}
        />
      ) : (
        "-"
      ),

    width: 80,
  },
];

// ===============================================
// CUSTOM HOOK:
// GROUP-AWARE PAGINATION
// ===============================================

const useGroupAwarePagination = (
  groupedData: any[],
  currentPage: number,
  pageSizeHint: number
) => {
  const [pageBoundaries, setPageBoundaries] = useState<
    { start: number; end: number }[]
  >([]);

  useEffect(() => {
    if (!groupedData || groupedData.length === 0) {
      setPageBoundaries([]);
      return;
    }

    const boundaries: { start: number; end: number }[] = [];

    let startIndex = 0;

    while (startIndex < groupedData.length) {
      let pageEnd = startIndex;

      const targetEndIndex = Math.min(
        startIndex + pageSizeHint,
        groupedData.length
      );

      while (pageEnd < targetEndIndex) {
        if (groupedData[pageEnd].isGroupStart) {
          const groupSize = groupedData[pageEnd].rowSpan;

          if (
            pageEnd + groupSize > targetEndIndex &&
            pageEnd > startIndex
          ) {
            break;
          }
        }

        pageEnd++;
      }

      if (
        pageEnd < groupedData.length &&
        !groupedData[pageEnd].isGroupStart
      ) {
        while (
          pageEnd < groupedData.length &&
          !groupedData[pageEnd].isGroupStart
        ) {
          pageEnd++;
        }
      }

      if (pageEnd === startIndex) {
        pageEnd = targetEndIndex;
      }

      boundaries.push({
        start: startIndex,
        end: pageEnd,
      });

      startIndex = pageEnd;
    }

    setPageBoundaries(boundaries);
  }, [groupedData, pageSizeHint]);

  const pageCount = pageBoundaries.length;

  const pageIndex = currentPage - 1;

  const currentBoundary = pageBoundaries[pageIndex];

  const currentData = useMemo(() => {
    if (!currentBoundary) {
      return [];
    }

    return groupedData.slice(
      currentBoundary.start,
      currentBoundary.end
    );
  }, [groupedData, currentBoundary]);

  return {
    currentData,
    pageCount,
  };
};

// ===============================================
// MAIN COMPONENT
// ===============================================

export default function Home() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [companyName, setCompanyName] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const loggingOutRef = useRef(false);

  const [currentPage, setCurrentPage] = useState(1);

  // ===============================================
  // FETCH PRODUCTS
  // ===============================================

  const fetchProducts = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sl_no", { ascending: true })
      .order("items", { ascending: true });

    if (error) {
      console.error("Error fetching products:", error);

      message.error("Failed to load products.");
    } else {
      setAllProducts(
        (data || []).map((item: any) => ({
          ...item,
          key: item.id,
        }))
      );
    }

    setLoading(false);
  }, []);

  // ===============================================
  // AUTOLOAD + REALTIME
  // ===============================================

  // useEffect(() => {
  //   fetchProducts();

  //   const channel = supabase
  //     .channel("realtime-products-customer-pricelist")
  //     .on(
  //       "postgres_changes",
  //       {
  //         event: "*",
  //         schema: "public",
  //         table: "products",
  //       },
  //       (payload) => {
  //         console.log(
  //           "Realtime product update:",
  //           payload
  //         );

  //         fetchProducts();
  //       }
  //     )
  //     .subscribe();

  //   return () => {
  //     supabase.removeChannel(channel);
  //   };
  // }, [fetchProducts]);


  useEffect(() => {
    if (checkingAuth) {
      return;
    }

    fetchProducts();

    const channel = supabase
      .channel("realtime-products-customer-pricelist")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
        },
        (payload) => {
          console.log(
            "Realtime product update:",
            payload
          );

          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProducts, checkingAuth]);






  useEffect(() => {
  let alreadyEnded = false;

  const handleSessionEnded = async () => {
    // Manual Logout should create LOGOUT,
    // not SESSION_ENDED.
    if (loggingOutRef.current) {
      return;
    }

    if (alreadyEnded) {
      return;
    }

    alreadyEnded = true;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        return;
      }

      await fetch("/api/customer/session-ended", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          reason: "browser_close",
        }),
        keepalive: true,
      });
    } catch (error) {
      console.error(
        "Unable to record SESSION_ENDED:",
        error
      );
    }
  };

  const handlePageHide = () => {
    handleSessionEnded();
  };

  window.addEventListener("pagehide", handlePageHide);

  return () => {
    window.removeEventListener("pagehide", handlePageHide);
  };
}, []);





  useEffect(() => {
    let mounted = true;

    const checkAuthentication = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      if (!mounted) return;

      setLoggedInUser(session.user);

      // Fetch the customer's profile
      const { data: profile, error } = await supabase
        .from("customer_profiles")
        .select("company_name, mobile_number")
        .eq("user_id", session.user.id)
        .single();

      if (error) {
        console.error("Customer profile error:", error);
      }

      if (profile) {
        setCompanyName(profile.company_name || "");
      }

      setCheckingAuth(false);
    };

    checkAuthentication();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.replace("/login");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);








  // ===============================================
  // handleLogout
  // ===============================================




const handleLogout = async () => {
  try {
    loggingOutRef.current = true;
    setLoggingOut(true);

      await logCustomerActivity({
        actionType: "LOGOUT",
        details: {
          method: "manual",
        },
      });

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout error:", error);
        message.error("Unable to logout. Please try again.");
        setLoggingOut(false);
        return;
      }

      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
      message.error("Unable to logout. Please try again.");
      setLoggingOut(false);
    }
  };

  // ===============================================
  // FILTER PRODUCTS
  // ===============================================

  const allFilteredProducts = useMemo(
    () =>
      allProducts.filter(
        (product) =>
          !searchTerm ||
          (product.items &&
            product.items
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (product.brand &&
            product.brand
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      ),
    [allProducts, searchTerm]
  );

  // ===============================================
  // GROUPED DATA
  // ===============================================

  const filteredAndGroupedData = useMemo(
    () =>
      getGroupedData(
        allFilteredProducts
      ),
    [allFilteredProducts]
  );

  // ===============================================
  // PAGINATION
  // ===============================================

  const {
    currentData: paginatedData,
    pageCount,
  } = useGroupAwarePagination(
    filteredAndGroupedData,
    currentPage,
    PAGE_SIZE_HINT
  );

  // ===============================================
  // SEARCH
  // ===============================================

  // const handleSearch = (value: string) => {
  //   setSearchTerm(value);
  //   setCurrentPage(1);
  // };




  const handleSearch = async (value: string) => {
    const cleanSearch = value.trim();

    setSearchTerm(value);
    setCurrentPage(1);

    if (!cleanSearch) {
      return;
    }

    const matchingProducts = allProducts.filter(
      (product) =>
        (product.items &&
          product.items
            .toLowerCase()
            .includes(cleanSearch.toLowerCase())) ||
        (product.brand &&
          product.brand
            .toLowerCase()
            .includes(cleanSearch.toLowerCase()))
    );

    await logCustomerActivity({
      actionType: "SEARCH",
      details: {
        search_term: cleanSearch,
        results_count: matchingProducts.length,
      },
    });
  };




  // ===============================================
  // PAGE CHANGE
  // ===============================================

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // ===============================================
  // RANGE INFORMATION
  // ===============================================

  const totalFilteredRows =
    filteredAndGroupedData.length;

  const currentPageDataSize =
    paginatedData.length;

  const startRange =
    currentPageDataSize > 0
      ? filteredAndGroupedData.indexOf(
        paginatedData[0]
      ) + 1
      : 0;

  const endRange =
    startRange > 0
      ? startRange +
      currentPageDataSize -
      1
      : 0;





  // ===============================================
  // BEFORE RENDER
  // ===============================================


  if (checkingAuth) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
        }}
      >
        Checking login...
      </div>
    );
  }







  // ===============================================
  // RENDER
  // ===============================================

  return (
    // <div style={{ padding: 20 }}>
    <div className={styles.pageContainer}>
      {/* =================================================
          ROW 1:
          HEADING
          ================================================= */}

      {/* <Flex
        justify="space-between"
        align="center"
        style={{
          marginBottom: 20,
        }}
      > */}


      <Flex
  justify="space-between"
  align="center"
  wrap="wrap"
  gap="middle"
  style={{
    marginBottom: 20,
  }}
>
        <Title
          level={2}
          style={{
            margin: 0,
          }}
        >
          EXOR Product Price List
        </Title>

        <Flex
  align="center"
  gap="middle"
  wrap="wrap"
>
          {companyName && (
            <Typography.Text strong>
              Welcome, {companyName}
            </Typography.Text>
          )}

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              border: "1px solid #d9d9d9",
              borderRadius: "6px",
              background: "#fff",
              padding: "8px 16px",
              cursor: loggingOut ? "not-allowed" : "pointer",
              fontSize: "14px",
            }}
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </Flex>
      </Flex>

      {/* =================================================
          ROW 2:
          SEARCH
          ================================================= */}

     <Flex
  justify="flex-end"
  align="center"
  wrap="wrap"
  gap="middle"
  style={{
    width: "100%",
  }}
>
  <Input.Search
    placeholder="Search by Item or Brand"
    allowClear
    onSearch={handleSearch}
    onChange={(e) => {
      setSearchTerm(e.target.value);
      setCurrentPage(1);
    }}
    style={{
      width: "100%",
      maxWidth: 350,
    }}
  />
</Flex>

      {/* =================================================
          PRODUCT TABLE
          ================================================= */}

      <div
        style={{
          marginTop: 20,
        }}
      >
        {/* <Table
          className={
            styles.responsivePriceTable
          }
          columns={columns}
          dataSource={paginatedData}
          loading={loading}
          rowKey="id"
          pagination={false}
          scroll={{
            x: "max-content",
          }}
        /> */}


<div className={styles.tableWrapper}>
  <Table
    className={styles.responsivePriceTable}
    columns={columns}
    dataSource={paginatedData}
    loading={loading}
    rowKey="id"
    pagination={false}
    scroll={{
      x: "max-content",
    }}
    size="small"
  />
</div>




        {/* <Table 
  className={styles.responsivePriceTable} 
  columns={columns} 
  dataSource={paginatedData} 
  loading={loading} 
  rowKey="id" 
  pagination={false} 
  scroll={{ 
    x: "max-content", 
  }}
  onRow={(record) => ({
    onClick: async () => {
      await logCustomerActivity({
        actionType: "PRODUCT_VIEW",
        details: {
          product_id: record.id,
          sl_no: record.sl_no,
          item: record.items,
          brand: record.brand,
        },
      });
    },
    style: {
      cursor: "pointer",
    },
  })}
/> */}
      </div>

      {/* =================================================
          PAGINATION
          ================================================= */}

      {totalFilteredRows > 0 && (
        <Pagination
          current={currentPage}
          total={pageCount}
          pageSize={1}
          onChange={handlePageChange}
          showTotal={() =>
            `${startRange}-${endRange} of ${totalFilteredRows} items (Group Aware)`
          }
          style={{
            marginTop: 20,
            textAlign: "right",
          }}
        />
      )}
    </div>
  );
}