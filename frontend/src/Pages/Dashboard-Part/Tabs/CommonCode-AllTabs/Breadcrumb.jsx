// v1.0.0 - Ashok - removed home tab path at breadcrumb
// v1.0.1 - Ashok - Improved responsiveness
import React from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { motion } from "framer-motion";

function Breadcrumb({ items }) {
  return (
    <motion.nav
      // v1.0.01 <------------------------------------------------------------------------------------------
      // className="flex py-3 px-5 text-muted-foreground bg-secondary/50 rounded-lg border border-border"
      className="sm:hidden flex py-3 px-5 text-muted-foreground bg-secondary/50 rounded-lg border border-border"
      // v1.0.01 ------------------------------------------------------------------------------------------>
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* v1.0.0 <------------------------------------------------------------------------- */}
      <ol className="inline-flex items-center space-x-1 md:space-x-3 flex-wrap">
        {/* <li className="inline-flex items-center">
          <Link to="/interviewList" className="inline-flex items-center text-sm font-medium text-foreground hover:text-custom-blue transition-colors">
            Home
          </Link>
        </li> */}
        {/* v1.0.0 ------------------------------------------------------------------------> */}
        {items.map((item, index) => (
          <li key={index} className="flex items-center py-1">
            <div className="flex items-center">
              {/* v1.0.0 <---------------------------------------------------------------------- */}
              {/* <ChevronRight className="w-4 h-4 text-muted-foreground" /> */}
              {index !== 0 && (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
              {/* v1.0.0 ----------------------------------------------------------------------> */}
              {item.path ? (
                <Link
                  to={item.path}
                  className="ml-1 text-sm font-medium text-foreground hover:text-custom-blue transition-colors md:ml-2 flex items-center"
                >
                  <span>
                    {item.label.charAt(0).toUpperCase() + item.label.slice(1)}
                  </span>
                  {item.status && (
                    <span className="ml-2">
                      <StatusBadge
                        status={
                          item.status.charAt(0).toUpperCase() +
                          item.status.slice(1)
                        }
                        size="sm"
                      />
                    </span>
                  )}
                </Link>
              ) : (
                <span className="ml-1 text-sm font-medium text-muted-foreground md:ml-2 flex items-center">
                  <span>
                    {item.label.charAt(0).toUpperCase() + item.label.slice(1)}
                  </span>
                  {item.status && (
                    <span className="ml-2">
                      <StatusBadge
                        status={
                          item.status.charAt(0).toUpperCase() +
                          item.status.slice(1)
                        }
                        size="sm"
                      />
                    </span>
                  )}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </motion.nav>
  );
}

export default Breadcrumb;
