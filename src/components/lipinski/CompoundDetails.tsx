"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { type LipinskiCompound } from '@/utils/lipinskiUtils';

interface CompoundDetailsProps {
  compound: LipinskiCompound;
  compoundName: string;
  radarPlot?: string;
}

const CompoundDetails: React.FC<CompoundDetailsProps> = ({
  compound,
  compoundName,
  radarPlot
}) => {
  // Check Lipinski compliance
  const violations = compound.Violations !== 'None' ? compound.Violations.split('; ') : [];
  const isCompliant = compound.FollowsLipinski === 'Yes';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {compoundName}
            {isCompliant ? (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                Lipinski Compliant
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="w-3 h-3 mr-1" />
                {violations.length} Violation{violations.length > 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="structure">Structure</TabsTrigger>
            <TabsTrigger value="radar">Radar Plot</TabsTrigger>
            <TabsTrigger value="atoms">Composition</TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Lipinski Rule of Five Properties */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Lipinski Rule of Five
                </h3>
                <div className="space-y-2">
                  <PropertyRow
                    label="Molecular Weight"
                    value={`${compound.MW.toFixed(2)} Da`}
                    limit="≤ 500 Da"
                    isViolation={compound.MW > 500}
                  />
                  <PropertyRow
                    label="LogP"
                    value={compound.LogP.toFixed(2)}
                    limit="≤ 5"
                    isViolation={compound.LogP > 5}
                  />
                  <PropertyRow
                    label="H-bond Donors"
                    value={compound.nHD.toString()}
                    limit="≤ 5"
                    isViolation={compound.nHD > 5}
                  />
                  <PropertyRow
                    label="H-bond Acceptors"
                    value={compound.nHA.toString()}
                    limit="≤ 10"
                    isViolation={compound.nHA > 10}
                  />
                </div>
              </div>

              {/* Additional Properties */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Additional Properties</h3>
                <div className="space-y-2">
                  <PropertyRow
                    label="TPSA"
                    value={`${compound.TPSA.toFixed(2)} Ų`}
                    description="Topological Polar Surface Area"
                  />
                  <PropertyRow
                    label="Rotatable Bonds"
                    value={compound.nRot.toString()}
                    description="Flexibility indicator"
                  />
                  <PropertyRow
                    label="Ring Count"
                    value={compound.nRing.toString()}
                    description="Number of rings"
                  />
                  <PropertyRow
                    label="Max Ring Size"
                    value={compound.MaxRing.toString()}
                    description="Largest ring size"
                  />
                  <PropertyRow
                    label="Synthetic Complexity"
                    value={compound.SC.toFixed(1)}
                    description="Bertz complexity index"
                  />
                </div>
              </div>
            </div>

            {/* Violations Summary */}
            {violations.length > 0 && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                  Rule of Five Violations:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-red-700 dark:text-red-300">
                  {violations.map((violation, index) => (
                    <li key={index}>{violation}</li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>

          <TabsContent value="structure">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-full max-w-md">
                <h3 className="text-lg font-semibold mb-2">SMILES Notation</h3>
                <div className="p-3 bg-gray-800 dark:bg-gray-800 rounded-lg font-mono text-sm break-all">
                  {compound.smiles}
                </div>
              </div>
              
              {compound.moleculeImage && (
                <div className="w-full max-w-lg">
                  <h3 className="text-lg font-semibold mb-2">2D Structure</h3>
                  <div className="border rounded-lg p-4 bg-white">
                    <img
                      src={compound.moleculeImage}
                      alt="Molecular structure"
                      className="w-full h-auto mx-auto"
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="radar">
            <div className="flex flex-col items-center">
              {radarPlot ? (
                <div className="w-full max-w-2xl">
                  <h3 className="text-lg font-semibold mb-4 text-center">
                    Properties Radar Plot
                  </h3>
                  <img
                    src={radarPlot}
                    alt="Radar plot"
                    className="w-full h-auto border rounded-lg"
                  />
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    Properties normalized against Lipinski Rule of Five limits
                  </p>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>Radar plot is being generated...</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="atoms">
            <div>
              <h3 className="text-lg font-semibold mb-4">Atomic Composition</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(compound.AtomDistribution).map(([element, count]) => (
                  <div
                    key={element}
                    className="flex items-center justify-between p-3 bg-gray-800 dark:bg-gray-800 rounded-lg"
                  >
                    <span className="font-semibold text-lg">{element}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <PropertyRow
                  label="Total Bonds"
                  value={compound.nBonds.toString()}
                />
                <PropertyRow
                  label="Heteroatoms"
                  value={compound.nHet.toString()}
                />
                <PropertyRow
                  label="Formal Charge"
                  value={compound.fChar.toString()}
                />
                <PropertyRow
                  label="LogS (Solubility)"
                  value={compound.LogS.toFixed(2)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface PropertyRowProps {
  label: string;
  value: string;
  limit?: string;
  description?: string;
  isViolation?: boolean;
}

const PropertyRow: React.FC<PropertyRowProps> = ({
  label,
  value,
  limit,
  description,
  isViolation = false
}) => {
  return (
    <div className={`flex justify-between items-center p-2 rounded ${
      isViolation ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-800 dark:bg-gray-800'
    }`}>
      <div>
        <span className={`font-medium ${isViolation ? 'text-red-800 dark:text-red-200' : ''}`}>
          {label}
        </span>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="text-right">
        <span className={`font-mono ${isViolation ? 'text-red-800 dark:text-red-200' : ''}`}>
          {value}
        </span>
        {limit && (
          <p className="text-xs text-muted-foreground">Limit: {limit}</p>
        )}
        {isViolation && (
          <XCircle className="w-4 h-4 text-red-600 inline-block ml-1" />
        )}
      </div>
    </div>
  );
};

export default CompoundDetails;
