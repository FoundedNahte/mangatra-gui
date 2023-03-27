// Credit to react-arborist
import React from "react";

type AnyRef = React.MutableRefObject<any> | React.RefCallback<any> | null;

export default function useMergeRefs(...refs: AnyRef[]) {
    return (instance: any) => {
        refs.forEach((ref) => {
            if (typeof ref === "function") {
                ref(instance)
            } else if (ref != null) {
                ref.current = instance;
            }
        })
    }
}