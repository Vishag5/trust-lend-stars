/**
 * Legal Provider Adapter
 * Provider-agnostic stub for e-Sign and e-Stamp integration
 * In demo mode, mocks these with timeouts and fake references
 */

export type LegalMode = 'ESIGN' | 'ESTAMP' | 'BOTH';

export interface LegalSession {
  provider_ref: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  mode: LegalMode;
  created_at: string;
}

class LegalProvider {
  private sessions: Map<string, LegalSession> = new Map();
  private isDemoMode: boolean;

  constructor() {
    // Check if running in demo mode (no backend)
    this.isDemoMode = !import.meta.env.VITE_SUPABASE_URL || 
                      import.meta.env.VITE_SUPABASE_URL.includes('demo');
  }

  /**
   * Create a new legal upgrade session
   * @param contractId - The contract ID to upgrade
   * @param mode - Type of legal upgrade (ESIGN, ESTAMP, or BOTH)
   * @returns Session with provider reference
   */
  async createSession(contractId: string, mode: LegalMode): Promise<{ provider_ref: string }> {
    const provider_ref = `legal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (this.isDemoMode) {
      // Mock session in demo mode
      const session: LegalSession = {
        provider_ref,
        status: 'PENDING',
        mode,
        created_at: new Date().toISOString(),
      };
      
      this.sessions.set(provider_ref, session);
      
      // Simulate async processing - auto-complete after 3 seconds
      setTimeout(() => {
        const existing = this.sessions.get(provider_ref);
        if (existing) {
          existing.status = 'COMPLETED';
          this.sessions.set(provider_ref, existing);
        }
      }, 3000);
      
      return { provider_ref };
    }
    
    // TODO: Integrate with actual e-Sign/e-Stamp provider API
    // Example: DigiLocker, eSign Gateway, etc.
    throw new Error('Production legal provider not yet implemented');
  }

  /**
   * Get the status of a legal upgrade session
   * @param provider_ref - The provider reference ID
   * @returns Current status of the session
   */
  async getStatus(provider_ref: string): Promise<'PENDING' | 'COMPLETED' | 'FAILED'> {
    if (this.isDemoMode) {
      const session = this.sessions.get(provider_ref);
      return session?.status || 'FAILED';
    }
    
    // TODO: Query actual provider API for status
    throw new Error('Production legal provider not yet implemented');
  }

  /**
   * Get full session details
   * @param provider_ref - The provider reference ID
   * @returns Session details or null if not found
   */
  async getSession(provider_ref: string): Promise<LegalSession | null> {
    if (this.isDemoMode) {
      return this.sessions.get(provider_ref) || null;
    }
    
    // TODO: Fetch from actual provider API
    throw new Error('Production legal provider not yet implemented');
  }

  /**
   * Cancel a pending legal upgrade session
   * @param provider_ref - The provider reference ID
   */
  async cancelSession(provider_ref: string): Promise<void> {
    if (this.isDemoMode) {
      const session = this.sessions.get(provider_ref);
      if (session && session.status === 'PENDING') {
        session.status = 'FAILED';
        this.sessions.set(provider_ref, session);
      }
      return;
    }
    
    // TODO: Cancel via actual provider API
    throw new Error('Production legal provider not yet implemented');
  }
}

// Export singleton instance
export const legalProvider = new LegalProvider();
