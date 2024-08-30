import React from "react"
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocument({spec}:{spec?:string|object}) {
    
    class OperationsLayout extends React.Component {
        render() {
          const {
            getComponent
          } = this.props
          const Operations = getComponent("operations", true)
      
          return (
            <div className="swagger-ui">
              <Operations />
            </div>
          )
        }
      }
      
    // Create the plugin that provides our layout component
    const OperationsLayoutPlugin = () => {
        return {
        components: {
            OperationsLayout: OperationsLayout
        }
        }
    }
    
    return(
        <SwaggerUI 
        spec={spec}
        supportedSubmitMethods={[]} 
        customComponents={{Header:()=>null}} 
        layout="OperationsLayout" 
        plugins={[OperationsLayoutPlugin ]}  />
    )
}